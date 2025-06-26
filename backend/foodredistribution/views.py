from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.http import HttpRequest
from .models import FoodDonation, FoodRequest, FoodCategory, Location, ClaimedDonation, Feedback, AIAuditLog
from django.conf import settings
from .serializers import (
    FoodDonationSerializer,
    FoodRequestSerializer,
    FoodCategorySerializer,
    LocationSerializer,
    ClaimedDonationSerializer,
    FeedbackSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .utils import send_notification_email, detect_cancellation_anomaly
from rest_framework.decorators import api_view, permission_classes
from django.core.mail import send_mail
from .ai_engine.matching_engine import matching_engine
from django.shortcuts import get_object_or_404, render, redirect
from rest_framework.permissions import IsAuthenticated, AllowAny
from .tasks import notify_fallback_receivers_task, send_pickup_reminders, send_feedback_reminders
from datetime import timedelta


CustomUser = get_user_model()

class FoodDonationViewSet(viewsets.ModelViewSet):
    queryset = FoodDonation.objects.all()
    serializer_class = FoodDonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['category', 'location__city', 'expiry_date'] 
    search_fields = ['description', 'category__name']
    ordering_fields = ['expiry_date', 'quantity']
    ordering = ['expiry_date']

    def perform_create(self, serializer):
        donation = serializer.save(donor=self.request.user)
        receivers = CustomUser.objects.exclude(id=self.request.user.id)
        emails = [user.email for user in receivers if user.email]

        if emails:
            subject = "New Food Donation Available"
            request: HttpRequest = self.request
            protocol = 'https' if request.is_secure() else 'http'
            domain = request.get_host()
            image_url = f"{protocol}://{domain}{donation.image.url}" if donation.image else None

            context = {
                "donor": donation.donor.username,
                "category": donation.category.name,
                "quantity": donation.quantity,
                "location": {
                    "city": donation.location.city,
                    "state": donation.location.state,
                    "zipcode": donation.location.zipcode,
                },
                "description": donation.description,
                "expiry_date": donation.expiry_date.strftime("%Y-%m-%d %H:%M") if donation.expiry_date else None,
                "image_url": image_url,
            }

            send_notification_email(subject, context, emails)

        # Anomaly detection example
        if detect_cancellation_anomaly(self.request.user):
            print(f"Anomaly detected: User {self.request.user.username} has excessive cancellations.")
            AIAuditLog.objects.create(
                user=self.request.user,
                action="anomaly_detected",
                details="User has cancelled more than 3 donations in the last 30 days."
            )
            # Notify admins
            subject = "Anomaly Detected: Excessive Cancellations"
            message = (
                f"User {self.request.user.username} has cancelled more than 3 donations in the last 30 days.\n"
                f"User email: {self.request.user.email}"
            )
            admin_emails = [email for name, email in getattr(settings, 'ADMINS', [])]
            if admin_emails:
                print("Sending anomaly email to admins:", admin_emails)
                send_mail(subject, message, None, admin_emails)

class FoodRequestViewSet(viewsets.ModelViewSet):
    queryset = FoodRequest.objects.all()
    serializer_class = FoodRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['category_name', 'location_city']
    search_fields = ['description', 'category__name']
    ordering_fields = ['request_date', 'updated_at']  # use actual model fields
    ordering = ['-request_date']  # default ordering

    def get_queryset(self):
        return FoodRequest.objects.filter(requester=self.request.user)

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)


class FoodCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FoodCategory.objects.all()
    serializer_class = FoodCategorySerializer
    permission_classes = [permissions.AllowAny]

class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.AllowAny]

def calculate_ai_match_score(donation, user, request_data=None):
    """Shared AI matching logic for both views"""
    try:
        dummy_request = type('obj', (object,), {
            'requester': user,
            'category': donation.category,
            'quantity': donation.quantity,
            'location': None,
            'preferred_tags': request_data.get('preferred_tags', '') if request_data else ''
        })
        
        features = matching_engine.feature_extractor.extract_features(
            donation, dummy_request,
            matching_engine._get_donor_stats(donation.donor),
            matching_engine._get_requester_stats(user)
        )
        
        match_score = matching_engine._calculate_match_score(features)
        return match_score, features
    except Exception as e:
        # Log error and return default values
        print(f"AI matching error: {e}")
        return 0.0, {}

# API ViewSet for claimed donations (REST API)
class ClaimedDonationViewSet(viewsets.ModelViewSet):
    queryset = ClaimedDonation.objects.all()
    serializer_class = ClaimedDonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['claimed_by']

    def perform_create(self, serializer):
        donation = serializer.validated_data.get('donation')
        match_score, features = calculate_ai_match_score(donation, self.request.user)
        
        claim = serializer.save(
            claimed_by=self.request.user,
            ai_matching_score=match_score,
            distance_km=features.get('distance_km'),
            ml_match_features=features
        )
        
        # Update donation status
        donation.status = 'collected'
        donation.save()
        
        # Log AI action for API claims
        AIAuditLog.objects.create(
            action='donation_claimed',
            donation=donation,
            claimed_donation=claim,
            user=self.request.user,
            details={
                'ai_match_score': match_score,
                'features': features
            }
        )

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(claimed_donation__claimed_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save()



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def request_matches_view(request, request_id):
    request_obj = get_object_or_404(FoodRequest, id=request_id)
    
    # Get top 3 best matches using your matching engine
    matches = matching_engine.find_best_donations(request_obj, top_k=3)

    formatted_matches = []
    for match in matches:
        donation = match['donation']
        features = match['features']
        score = round(match['score'], 2)

        # Use updated_at if created_at is not defined
        created_time = getattr(donation, 'created_at', donation.updated_at)
        hours_to_expiry = round((donation.expiry_date - created_time).total_seconds() / 3600)

        summary = f"""
🏪 Restaurant has: {donation.quantity}kg {donation.category.name.lower()}, expires in {hours_to_expiry} hours, {donation.location.city}
🏠 NGO needs: {request_obj.quantity}kg {request_obj.category.name.lower() if request_obj.category else 'any food'}, also in {request_obj.location.city}

✅ Distance: {round(features.get('distance_km', 0), 2)}km
✅ Quantity: {donation.quantity}kg for {request_obj.quantity}kg need
✅ Category: {'matches' if features.get('category_match') else 'does not match'}
✅ Freshness: {features.get('freshness_score', 0):.2f} (higher is fresher)
✅ Priority: {'High' if features.get('requester_priority', 0) > 0.5 else 'Normal'}
✅ Reliability: Good (donor: {features.get('donor_reliability', 0):.2f})

🎯 Final Score: {score} {'(Excellent Match!)' if score >= 0.85 else '(Good Match)' if score >= 0.7 else '(Average)'}
        """.strip()

        formatted_matches.append({
            'id': donation.id,
            'donation': {
                'id': donation.id,
                'category': { 'name': donation.category.name },
                'quantity': donation.quantity,
                'location': {
                    'city': donation.location.city,
                    'state': donation.location.state
                },
                'donor': { 'username': donation.donor.username },
                'expiry_date': donation.expiry_date.isoformat()
            },
            'score': score,
            'distance': round(features.get('distance_km', 0), 2),
            'summary': summary
        })

    return Response(formatted_matches)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_donation_view(request, donation_id):
    """
    API View: Claim a donation with AI matching score
    """
    donation = get_object_or_404(FoodDonation, id=donation_id)

    if donation.status == 'collected':
        return Response({"error": "This donation has already been claimed."}, status=status.HTTP_400_BAD_REQUEST)

    match_score, features = calculate_ai_match_score(donation, request.user, request.data)

    # Create claim record
    claim = ClaimedDonation.objects.create(
        donation=donation,
        claimed_by=request.user,
        ai_matching_score=match_score,
        distance_km=features.get('distance_km'),
        ml_match_features=features
    )

    # Update donation status
    donation.status = 'collected'
    donation.save()

    # Log AI action
    AIAuditLog.objects.create(
        action='donation_claimed',
        donation=donation,
        claimed_donation=claim,
        user=request.user,
        details={
            'ai_match_score': match_score,
            'features': features
        }
    )

    return Response({
        "message": "Donation claimed successfully.",
        "donation_id": donation.id,
        "claim_id": claim.id,
        "match_score": match_score,
        "features": features
    }, status=status.HTTP_201_CREATED)

    
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# views.py (at the bottom)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
@api_view(['POST'])
def trigger_reminders(request):
    reminder_type = request.data.get('type')
    if reminder_type == "pickup":
        send_pickup_reminders.delay()
        return Response({"message": "Pickup reminder task triggered."})
    elif reminder_type == "feedback":
        send_feedback_reminders.delay()
        return Response({"message": "Feedback reminder task triggered."})
    return Response({"error": "Invalid type. Use 'pickup' or 'feedback'."}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_donations(request):
    donations = FoodDonation.objects.filter(status='pending')
    serializer = FoodDonationSerializer(donations, many=True)
    return Response(serializer.data)

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FoodDonationViewSet,
    FoodRequestViewSet,
    FoodCategoryViewSet,
    LocationViewSet,
    ClaimedDonationViewSet,
    FeedbackViewSet,
    trigger_reminders, 
    request_matches_view,
    claim_donation_view,
    RegisterView,
    UserDetailView,
    available_donations,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Create the router and register the viewsets
router = DefaultRouter()
router.register(r'donations', FoodDonationViewSet)
router.register(r'requests', FoodRequestViewSet)
router.register(r'categories', FoodCategoryViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'claims', ClaimedDonationViewSet)
router.register(r'feedback', FeedbackViewSet)

# Define urlpatterns
urlpatterns = [
    path('', include(router.urls)),

    # Registration & user info
    path('register/', RegisterView.as_view(), name='register'),
    path('user/', UserDetailView.as_view(), name='user-detail'),

    # JWT Auth
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    path('requests/<int:request_id>/matches/', request_matches_view, name='request_matches'),
    path('donations/<int:donation_id>/claim/', claim_donation_view, name='claim_donation'),
    path('donations/available/', available_donations),

    # Trigger tasks
    path('trigger-reminder/', trigger_reminders),
]
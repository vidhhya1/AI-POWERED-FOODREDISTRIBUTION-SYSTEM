from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.utils import timezone
from datetime import timedelta

# --- USER MODEL ---
class CustomUser(AbstractUser):
    is_donor = models.BooleanField(default=False)
    is_requester = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    organization_name = models.CharField(max_length=255, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)

    def __str__(self):
        return self.username


# --- SUPPORT MODELS ---
class FoodCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Location(models.Model):
    address_line = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zipcode = models.CharField(max_length=20, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    def __str__(self):
        return f"{self.city}, {self.state}"


# --- FOOD DONATION MODEL ---
class FoodDonation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('collected', 'Collected'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]

    donor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='donations')
    category = models.ForeignKey(FoodCategory, on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True)
    quantity = models.FloatField(help_text="Quantity in kilograms", validators=[MinValueValidator(0.1)])
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags e.g., vegetarian,gluten-free")
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    donation_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    image = models.ImageField(upload_to='donation_images/', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    # --- AI/ML fields ---
    ai_freshness_score = models.FloatField(null=True, blank=True, help_text="Freshness score 0-1 from AI model")
    ai_category_prediction = models.CharField(max_length=100, blank=True, null=True, help_text="Predicted category by AI")
    ai_confidence_score = models.FloatField(null=True, blank=True, help_text="Confidence score 0-1 from AI prediction")

    # Offline ML audit info (for model training and auditing)
    ml_features_extracted = models.JSONField(null=True, blank=True, help_text="Raw features extracted for offline ML")
    ml_label_assigned = models.CharField(max_length=100, blank=True, null=True, help_text="Label assigned during offline ML process")
    ml_training_flag = models.BooleanField(default=False, help_text="If this data was used for training offline ML model")
    

    def __str__(self):
        cat = self.category.name if self.category else "Uncategorized"
        return f"{self.quantity}kg {cat} by {self.donor.username}"

    def is_expired(self):
        return self.expiry_date and timezone.now() > self.expiry_date


# --- FOOD REQUEST MODEL ---
class FoodRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
    ]

    requester = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='requests')
    category = models.ForeignKey(FoodCategory, on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True)
    quantity = models.FloatField(help_text="Quantity in kilograms", validators=[MinValueValidator(0.1)])
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    request_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    updated_at = models.DateTimeField(auto_now=True)

    preferred_tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated preferred tags")

    def _str_(self):
        cat = self.category.name if self.category else "Uncategorized"
        return f"{self.quantity}kg {cat} requested by {self.requester.username}"


# --- CLAIMED DONATION MODEL ---
class ClaimedDonation(models.Model):
    donation = models.ForeignKey(FoodDonation, on_delete=models.CASCADE, related_name='claims')
    claimed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    claim_date = models.DateTimeField(auto_now_add=True)

    # AI matching info (real-time or offline match scoring)
    ai_matching_score = models.FloatField(null=True, blank=True, help_text="AI match score between donation and requester (0-1)")
    distance_km = models.FloatField(null=True, blank=True, help_text="Distance in kilometers between donor and requester")

    # Offline ML tracking (training and audit purposes)
    ml_match_features = models.JSONField(null=True, blank=True, help_text="Features used for matching in offline ML")
    ml_label = models.CharField(max_length=100, blank=True, null=True, help_text="Label assigned during offline ML matching")
    ml_training_flag = models.BooleanField(default=False, help_text="If this claim was used for offline ML training")

    def __str__(self):
        return f"{self.claimed_by.username} claimed {self.donation}"


# --- FEEDBACK MODEL ---
class Feedback(models.Model):
    claimed_donation = models.OneToOneField(ClaimedDonation, on_delete=models.CASCADE, related_name='feedback')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comments = models.TextField(blank=True)
    is_helpful = models.BooleanField(default=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        user = self.claimed_donation.claimed_by.username if self.claimed_donation else "Unknown"
        return f"Feedback by {user} - {self.rating}★"


# --- AI AUDIT LOG MODEL ---
class AIAuditLog(models.Model):
    # Log AI-related decisions/actions for traceability & compliance
    timestamp = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=100, help_text="AI action e.g., 'prediction', 'matching', 'flagged_for_review'")
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, help_text="User involved, if any")
    donation = models.ForeignKey(FoodDonation, on_delete=models.SET_NULL, null=True, blank=True)
    request = models.ForeignKey(FoodRequest, on_delete=models.SET_NULL, null=True, blank=True)
    claimed_donation = models.ForeignKey(ClaimedDonation, on_delete=models.SET_NULL, null=True, blank=True)
    details = models.JSONField(blank=True, null=True, help_text="Detailed AI metadata and scores")

    def __str__(self):
        return f"AI Audit: {self.action} at {self.timestamp}"


# --- GENERAL AUDIT LOG MODEL ---
class DonationLog(models.Model):
    donation = models.ForeignKey(FoodDonation, on_delete=models.CASCADE)
    action = models.CharField(max_length=50)  # e.g., 'claimed', 'cancelled', 'expired', 'matched_by_ai'
    performed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        user = self.performed_by.username if self.performed_by else "System"
        return f"{self.action} by {user} on {self.donation}"
    
# Add to your models or create a new monitoring model
class AIPerformanceMetrics(models.Model):
    date = models.DateField(auto_now_add=True)
    total_matches_generated = models.IntegerField(default=0)
    successful_matches = models.IntegerField(default=0)
    average_match_score = models.FloatField(default=0.0)
    average_feedback_rating = models.FloatField(default=0.0)
    
    class Meta:
        unique_together = ['date']
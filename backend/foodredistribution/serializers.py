from rest_framework import serializers
from .models import (
    FoodDonation, FoodRequest, FoodCategory, Location, ClaimedDonation, Feedback
)
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password


CustomUser = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email']

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'address_line', 'city', 'state', 'zipcode', 'latitude', 'longitude']

class FoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodCategory
        fields = ['id', 'name']

class FoodDonationSerializer(serializers.ModelSerializer):
    donor = UserSerializer(read_only=True)
    category = serializers.CharField(write_only=True)
    category_detail = FoodCategorySerializer(source='category', read_only=True)
    location = LocationSerializer()
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = FoodDonation
        exclude = ['ml_features_extracted', 'ml_label_assigned', 'ml_training_flag']

    def create(self, validated_data):
        validated_data.pop('donor', None)

        category_name = validated_data.pop('category')
        location_data = validated_data.pop('location')

        category, _ = FoodCategory.objects.get_or_create(name=category_name.strip())
        location, _ = Location.objects.get_or_create(**location_data)

        donation = FoodDonation.objects.create(
            donor=self.context['request'].user,
            category=category,
            location=location,
            **validated_data
        )
        return donation

    def update(self, instance, validated_data):
        category_name = validated_data.pop('category', None)
        location_data = validated_data.pop('location', None)

        if category_name:
            category, _ = FoodCategory.objects.get_or_create(name=category_name.strip())
            instance.category = category
        if location_data:
            location, _ = Location.objects.get_or_create(**location_data)
            instance.location = location

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class FoodRequestSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    category = serializers.CharField(write_only=True)
    category_detail = FoodCategorySerializer(source='category', read_only=True)
    location = LocationSerializer()

    class Meta:
        model = FoodRequest
        fields = '__all__'

    def create(self, validated_data):
        validated_data.pop('requester', None)

        category_name = validated_data.pop('category')
        location_data = validated_data.pop('location')

        category, _ = FoodCategory.objects.get_or_create(name=category_name.strip())
        location, _ = Location.objects.get_or_create(**location_data)

        request = FoodRequest.objects.create(
            requester=self.context['request'].user,
            category=category,
            location=location,
            **validated_data
        )
        return request

    def update(self, instance, validated_data):
        category_name = validated_data.pop('category', None)
        location_data = validated_data.pop('location', None)

        if category_name:
            category, _ = FoodCategory.objects.get_or_create(name=category_name.strip())
            instance.category = category
        if location_data:
            location, _ = Location.objects.get_or_create(**location_data)
            instance.location = location

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ClaimedDonationSerializer(serializers.ModelSerializer):
    # Accept donation ID on input
    donation = serializers.PrimaryKeyRelatedField(queryset=FoodDonation.objects.all(), write_only=True)
    # Return nested donation details on output
    donation_details = FoodDonationSerializer(source='donation', read_only=True)
    claimed_by = UserSerializer(read_only=True)

    class Meta:
        model = ClaimedDonation
        fields = ['id', 'donation', 'donation_details', 'claimed_by', 'claim_date']

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'claimed_donation', 'rating', 'comments', 'submitted_at']
        read_only_fields = ['submitted_at']

    def validate_claimed_donation(self, value):
        user = self.context['request'].user
        if value.claimed_by != user:
            raise serializers.ValidationError("You can only submit feedback for your own claimed donations.")
        if hasattr(value, 'feedback'):
            raise serializers.ValidationError("Feedback already submitted for this donation.")
        return value
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'phone_number',
            'organization_name', 'is_donor', 'is_requester', 'profile_image'
        ]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = (
            'username', 'password', 'email', 'phone_number', 'organization_name',
            'is_donor', 'is_requester', 'profile_image'
        )

    def create(self, validated_data):
        return CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            phone_number=validated_data.get('phone_number', ''),
            organization_name=validated_data.get('organization_name', ''),
            is_donor=validated_data.get('is_donor', False),
            is_requester=validated_data.get('is_requester', False),
            profile_image=validated_data.get('profile_image', None),
        )
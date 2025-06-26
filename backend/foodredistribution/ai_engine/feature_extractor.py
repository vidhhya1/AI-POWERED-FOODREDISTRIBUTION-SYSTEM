import pandas as pd
from geopy.distance import geodesic
from datetime import datetime, timedelta
from django.utils import timezone
import json

class FeatureExtractor:
    def __init__(self):
        self.feature_names = [
            'distance_km',
            'quantity_match_score',
            'category_match',
            'freshness_score',
            'time_urgency',
            'donor_reliability',
            'requester_priority',
            'tag_similarity'
        ]
    
    def extract_features(self, donation, request, donor_stats=None, requester_stats=None):
        """Extract features for donation-request pair"""
        features = {}
        
        # 1. Distance feature
        features['distance_km'] = self._calculate_distance(donation, request)
        
        # 2. Quantity matching
        features['quantity_match_score'] = self._calculate_quantity_match(donation, request)
        
        # 3. Category matching
        features['category_match'] = self._calculate_category_match(donation, request)
        
        # 4. Freshness/urgency
        features['freshness_score'] = self._calculate_freshness_score(donation)
        features['time_urgency'] = self._calculate_time_urgency(donation)
        
        # 5. User reliability scores
        features['donor_reliability'] = self._calculate_donor_reliability(donation.donor, donor_stats)
        features['requester_priority'] = self._calculate_requester_priority(request.requester, requester_stats)
        
        # 6. Tag similarity
        features['tag_similarity'] = self._calculate_tag_similarity(donation, request)
        
        return features
    
    def _calculate_distance(self, donation, request):
        """Calculate distance between donation and request locations"""
        if not (donation.location and request.location):
            return 50.0  # Default penalty for missing location
        
        if not all([donation.location.latitude, donation.location.longitude,
                   request.location.latitude, request.location.longitude]):
            return 50.0
        
        donor_coords = (float(donation.location.latitude), float(donation.location.longitude))
        requester_coords = (float(request.location.latitude), float(request.location.longitude))
        
        return geodesic(donor_coords, requester_coords).kilometers
    
    def _calculate_quantity_match(self, donation, request):
        """Score how well quantities match (0-1)"""
        if donation.quantity >= request.quantity:
            if donation.quantity <= request.quantity * 2:
                return 1.0  # Perfect or reasonable excess
            else:
                return 0.7  # Too much excess
        else:
            return donation.quantity / request.quantity  # Partial fulfillment
    
    def _calculate_category_match(self, donation, request):
        """Binary category match"""
        if donation.category and request.category:
            return 1.0 if donation.category == request.category else 0.3
        return 0.5  # Default for missing categories
    
    def _calculate_freshness_score(self, donation):
        """Calculate freshness based on expiry (0-1)"""
        if not donation.expiry_date:
            return 0.8  # Default good score for no expiry
        
        now = timezone.now()
        time_to_expiry = donation.expiry_date - now
        
        if time_to_expiry.total_seconds() <= 0:
            return 0.0  # Expired
        elif time_to_expiry.days >= 2:
            return 1.0  # Very fresh
        elif time_to_expiry.days >= 1:
            return 0.8  # Fresh
        elif time_to_expiry.total_seconds() >= 6 * 3600:  # 6+ hours
            return 0.6  # Moderately fresh
        else:
            return 0.3  # Urgent
    
    def _calculate_time_urgency(self, donation):
        """Higher score for more urgent donations"""
        if not donation.expiry_date:
            return 0.5
        
        time_to_expiry = donation.expiry_date - timezone.now()
        if time_to_expiry.total_seconds() <= 0:
            return 1.0  # Most urgent (expired)
        elif time_to_expiry.total_seconds() <= 6 * 3600:  # 6 hours
            return 0.9
        elif time_to_expiry.days <= 1:
            return 0.7
        else:
            return 0.3
    
    def _calculate_donor_reliability(self, donor, stats):
        """Calculate donor reliability score"""
        if not stats:
            return 0.5  # Default for new donors
        
        total_donations = stats.get('total_donations', 0)
        successful_donations = stats.get('successful_donations', 0)
        
        if total_donations == 0:
            return 0.5
        
        success_rate = successful_donations / total_donations
        return min(success_rate + 0.1, 1.0)  # Small bonus for participation
    
    def _calculate_requester_priority(self, requester, stats):
        """Calculate requester priority (NGOs get higher priority)"""
        base_score = 0.5
        
        # Check if it's an organization
        if requester.organization_name:
            base_score += 0.3
        
        # Historical success factor
        if stats:
            successful_requests = stats.get('successful_requests', 0)
            total_requests = stats.get('total_requests', 0)
            if total_requests > 0:
                success_rate = successful_requests / total_requests
                base_score += (success_rate * 0.2)
        
        return min(base_score, 1.0)
    
    def _calculate_tag_similarity(self, donation, request):
        """Calculate similarity between tags"""
        donation_tags = set(tag.strip().lower() for tag in donation.tags.split(',') if tag.strip())
        request_tags = set(tag.strip().lower() for tag in request.preferred_tags.split(',') if tag.strip())
        
        if not donation_tags and not request_tags:
            return 0.5  # No tags on either side
        
        if not donation_tags or not request_tags:
            return 0.3  # One side has no tags
        
        intersection = donation_tags.intersection(request_tags)
        union = donation_tags.union(request_tags)
        
        return len(intersection) / len(union) if union else 0.0
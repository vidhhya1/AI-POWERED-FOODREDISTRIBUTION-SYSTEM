from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np
import pickle
import os
from django.conf import settings
from .feature_extractor import FeatureExtractor
from foodredistribution.models import FoodDonation, FoodRequest, ClaimedDonation, Feedback

class SmartMatchingEngine:
    def __init__(self):
        self.feature_extractor = FeatureExtractor()
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = os.path.join(settings.BASE_DIR, 'ai_engine', 'models', 'matching_model.pkl')
        self.scaler_path = os.path.join(settings.BASE_DIR, 'ai_engine', 'models', 'scaler.pkl')
        self._load_or_initialize_model()
    
    def _load_or_initialize_model(self):
        """Load existing model or create new one"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                with open(self.scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                print("Loaded existing matching model")
            else:
                self._initialize_model()
        except Exception as e:
            print(f"Error loading model: {e}")
            self._initialize_model()
    
    def _initialize_model(self):
        """Initialize new model with default parameters"""
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            min_samples_split=5,
            min_samples_leaf=2
        )
        print("Initialized new matching model")
    
    def find_best_matches(self, donation, top_k=3):
        """Find best matching requests for a donation"""
        # Get all pending requests
        pending_requests = FoodRequest.objects.filter(status='pending')
        
        if not pending_requests.exists():
            return []
        
        matches = []
        
        for request in pending_requests:
            # Extract features
            features = self.feature_extractor.extract_features(
                donation, request,
                self._get_donor_stats(donation.donor),
                self._get_requester_stats(request.requester)
            )
            
            # Calculate match score
            match_score = self._calculate_match_score(features)
            
            matches.append({
                'request': request,
                'score': match_score,
                'features': features,
                'distance_km': features['distance_km']
            })
        
        # Sort by score (higher is better) and return top k
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches[:top_k]
    
    def _calculate_match_score(self, features):
        """Calculate match score using ML model or rule-based approach"""
        try:
            # Prepare features for model
            feature_vector = [features[name] for name in self.feature_extractor.feature_names]
            feature_array = np.array(feature_vector).reshape(1, -1)
            
            # Use ML model if trained
            if hasattr(self.model, 'predict') and len(self.scaler.scale_) > 0:
                scaled_features = self.scaler.transform(feature_array)
                score = self.model.predict(scaled_features)[0]
                return max(0, min(1, score))  # Clamp between 0 and 1
            else:
                # Fallback to rule-based scoring
                return self._rule_based_scoring(features)
        
        except Exception as e:
            print(f"Error in ML prediction: {e}")
            return self._rule_based_scoring(features)
    
    def _rule_based_scoring(self, features):
        """Rule-based scoring as fallback"""
        # Weighted combination of features
        weights = {
            'distance_km': -0.02,  # Negative weight (closer is better)
            'quantity_match_score': 0.25,
            'category_match': 0.20,
            'freshness_score': 0.15,
            'time_urgency': 0.10,
            'donor_reliability': 0.10,
            'requester_priority': 0.15,
            'tag_similarity': 0.05
        }
        
        score = 0.5  # Base score
        
        for feature, weight in weights.items():
            if feature in features:
                if feature == 'distance_km':
                    # Distance penalty (max 50km)
                    distance_score = max(0, 1 - features[feature] / 50.0)
                    score += weight * distance_score * 10  # Scale up the weight effect
                else:
                    score += weight * features[feature]
        
        return max(0, min(1, score))
    
    def _get_donor_stats(self, donor):
        """Get donor statistics for reliability calculation"""
        total_donations = FoodDonation.objects.filter(donor=donor).count()
        successful_donations = FoodDonation.objects.filter(
            donor=donor, 
            status='collected'
        ).count()
        
        return {
            'total_donations': total_donations,
            'successful_donations': successful_donations
        }
    
    def _get_requester_stats(self, requester):
        """Get requester statistics"""
        claimed_donations = ClaimedDonation.objects.filter(claimed_by=requester)
        total_requests = claimed_donations.count()
        successful_requests = claimed_donations.filter(
            donation__status='collected'
        ).count()
        
        return {
            'total_requests': total_requests,
            'successful_requests': successful_requests
        }
    
    def train_model_from_feedback(self):
        """Train/retrain model using feedback data"""
        print("Training matching model from feedback data...")
        
        # Collect training data
        training_data = []
        claimed_donations = ClaimedDonation.objects.filter(
            feedback__isnull=False
        ).select_related('donation', 'claimed_by', 'feedback')
        
        if claimed_donations.count() < 10:
            print("Not enough feedback data for training (minimum 10 required)")
            return False
        
        for claim in claimed_donations:
            # Create a dummy request based on the claim
            features = self.feature_extractor.extract_features(
                claim.donation,
                self._create_dummy_request_from_claim(claim),
                self._get_donor_stats(claim.donation.donor),
                self._get_requester_stats(claim.claimed_by)
            )
            
            # Use feedback rating as target (normalize to 0-1)
            target_score = (claim.feedback.rating - 1) / 4.0  # 1-5 scale to 0-1
            
            feature_vector = [features[name] for name in self.feature_extractor.feature_names]
            training_data.append(feature_vector + [target_score])
        
        if len(training_data) < 10:
            print("Insufficient training data after processing")
            return False
        
        # Convert to DataFrame
        columns = self.feature_extractor.feature_names + ['target']
        df = pd.DataFrame(training_data, columns=columns)
        
        # Prepare features and targets
        X = df[self.feature_extractor.feature_names].values
        y = df['target'].values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        
        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(self.scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        print(f"Model trained successfully with {len(training_data)} samples")
        return True
    
    def _create_dummy_request_from_claim(self, claim):
        """Create a dummy request object from claimed donation for training"""
        class DummyRequest:
            def __init__(self, claim):
                self.requester = claim.claimed_by
                self.category = claim.donation.category
                self.quantity = claim.donation.quantity  # Assume they wanted similar quantity
                self.location = None  # We'll use distance from claim if available
                self.preferred_tags = ""
        
        return DummyRequest(claim)

# Global instance
matching_engine = SmartMatchingEngine()
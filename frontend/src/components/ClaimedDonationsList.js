// frontend/src/components/ClaimedDonationsList.js
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import api from '../api';
import FeedbackForm from './FeedbackForm';

// Import MUI Components
import {
  Typography, Button, Box, Grid, Card, CardContent, CardActions,
  CardMedia, LinearProgress, Rating
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FeedbackIcon from '@mui/icons-material/Feedback';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FastfoodIcon from '@mui/icons-material/Fastfood';


const ClaimedDonationsList = forwardRef(({ currentUserId }, ref) => {
  const [claimedDonations, setClaimedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [submittingFeedbackFor, setSubmittingFeedbackFor] = useState(null);

  const fetchClaimedDonations = async () => {
    try {
      const response = await api.get('claims/');
      const userClaims = response.data.filter(
        (claim) => claim.claimed_by && claim.claimed_by.id === currentUserId
      );
      setClaimedDonations(userClaims);
    } catch (err) {
      console.error('Failed to fetch claimed donations:', err);
      setError('Failed to load your claimed donations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchClaimedDonations();
    }
  }, [currentUserId, refreshKey]);

  useImperativeHandle(ref, () => ({
    refreshList() {
      setRefreshKey(prevKey => prevKey + 1);
      setSubmittingFeedbackFor(null);
    }
  }));

  const handleFeedbackSuccess = (feedbackData) => {
    setSubmittingFeedbackFor(null);
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleCancelFeedback = () => {
    setSubmittingFeedbackFor(null);
  };

  if (loading) {
    return <LinearProgress sx={{ my: 2 }} />;
  }

  if (error) {
    return <Typography color="error.main">{error}</Typography>;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Your Claimed Donations
      </Typography>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={() => setRefreshKey(prevKey => prevKey + 1)}
        sx={{ mb: 2 }}
      >
        Refresh Claimed List
      </Button>

      {claimedDonations.length === 0 ? (
        <Typography>You have not claimed any donations yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {claimedDonations.map((claim) => (
            <Grid item xs={12} sm={6} md={4} key={claim.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {claim.donation_details && claim.donation_details.image && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={claim.donation_details.image}
                    alt={claim.donation_details.description}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    Claimed: {claim.donation_details ? claim.donation_details.description : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon fontSize="small" /> <strong>Claim Date:</strong> {new Date(claim.claim_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FastfoodIcon fontSize="small" /> <strong>Quantity:</strong> {claim.donation_details ? claim.donation_details.quantity + ' kg' : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong> {claim.donation_details ? claim.donation_details.status : 'N/A'}
                  </Typography>
                </CardContent>
                <CardActions>
                  {claim.feedback ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon color="success" />
                      <Typography color="success.main" variant="body2">Feedback Submitted</Typography>
                      <Rating name="read-only-rating" value={claim.feedback.rating} readOnly size="small" />
                    </Box>
                  ) : (
                    submittingFeedbackFor === claim.id ? (
                      <FeedbackForm
                        claimedDonationId={claim.id}
                        onFeedbackSuccess={handleFeedbackSuccess}
                        onCancel={handleCancelFeedback}
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<FeedbackIcon />}
                        onClick={() => setSubmittingFeedbackFor(claim.id)}
                      >
                        Submit Feedback
                      </Button>
                    )
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
});

export default ClaimedDonationsList;
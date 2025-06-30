// frontend/src/components/RequestMatches.js
import React, { useState, useEffect } from 'react';
import api from '../api';

// Import MUI Components
import {
  Typography, Button, Box, Grid, Card, CardContent, CardActions,
  CardMedia, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star'; // For match score
import AltRouteIcon from '@mui/icons-material/AltRoute'; // For distance


function RequestMatches({ requestId, onBackToList, onClaimSuccess }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [claimConfirmOpen, setClaimConfirmOpen] = useState(false);
  const [donationToClaimId, setDonationToClaimId] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get(`requests/${requestId}/matches/`);
        setMatches(response.data);
      } catch (err) {
        console.error(`Failed to fetch matches for request ${requestId}:`, err.response ? err.response.data : err.message);
        setError('Failed to load potential matches. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchMatches();
    }
  }, [requestId]);

  const handleClaimConfirmOpen = (donationId) => {
    setDonationToClaimId(donationId);
    setClaimConfirmOpen(true);
  };

  const handleClaimConfirmClose = () => {
    setClaimConfirmOpen(false);
    setDonationToClaimId(null);
  };

  const handleClaim = async () => {
    if (donationToClaimId) {
      setMessage('');
      setError('');
      try {
        const response = await api.post(`donations/${donationToClaimId}/claim/`);
        setMessage('Donation claimed successfully from matches!');
        setMatches(prevMatches => prevMatches.filter(m => (m.id || m.donation.id) !== donationToClaimId));
        if (onClaimSuccess) {
          onClaimSuccess(response.data);
        }
        console.log('Donation claimed from matches:', response.data);
        handleClaimConfirmClose();
      } catch (err) {
        console.error('Claiming matched donation failed:', err.response ? err.response.data : err.message);
        setError(err.response && err.response.data ? JSON.stringify(err.response.data) : 'Failed to claim donation. It might already be claimed or unavailable.');
      }
    }
  };

  if (loading) {
    return <Typography>Loading potential matches...</Typography>;
  }

  if (error) {
    return <Typography color="error.main">{error}</Typography>;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Potential Matches for Your Request (ID: {requestId})
      </Typography>
      <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBackToList} sx={{ mb: 2 }}>Back to My Requests</Button>

      {message && <Typography color="success.main" sx={{ mb: 2 }}>{message}</Typography>}
      {error && <Typography color="error.main" sx={{ mb: 2 }}>{error}</Typography>}

      {matches.length === 0 ? (
        <Typography>No potential matches found for this request yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {matches.map((match) => (
            <Grid item xs={12} sm={6} md={4} key={match.id || match.donation.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {(match.image || (match.donation && match.donation.image)) && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={match.image || match.donation.image}
                    alt={match.description || match.donation.description}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {match.description || match.donation.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon fontSize="small" /> <strong>Match Score:</strong> {match.ai_matching_score ? (match.ai_matching_score * 100).toFixed(2) + '%' : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AltRouteIcon fontSize="small" /> <strong>Distance:</strong> {match.distance_km ? match.distance_km.toFixed(2) + ' km' : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FastfoodIcon fontSize="small" /> <strong>Quantity:</strong> {match.quantity || match.donation.quantity} kg
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon fontSize="small" /> <strong>Expires:</strong> {new Date(match.expiry_date || match.donation.expiry_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CategoryIcon fontSize="small" /> <strong>Category:</strong> {(match.category_detail && match.category_detail.name) || (match.donation && match.donation.category_detail && match.donation.category_detail.name) || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon fontSize="small" /> <strong>Location:</strong> {(match.location && `${match.location.city}, ${match.location.state}`) || (match.donation && match.donation.location && `${match.donation.location.city}, ${match.donation.location.state}`) || 'N/A'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleClaimConfirmOpen(match.id || match.donation.id)}
                  >
                    Claim This Donation
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Claim Confirmation Dialog */}
      <Dialog
        open={claimConfirmOpen}
        onClose={handleClaimConfirmClose}
        aria-labelledby="claim-dialog-title"
        aria-describedby="claim-dialog-description"
      >
        <DialogTitle id="claim-dialog-title">{"Confirm Claim"}</DialogTitle>
        <DialogContent>
          <Typography id="claim-dialog-description">
            Are you sure you want to claim this matched donation?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClaimConfirmClose}>Cancel</Button>
          <Button onClick={handleClaim} color="primary" autoFocus variant="contained">
            Claim
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RequestMatches;
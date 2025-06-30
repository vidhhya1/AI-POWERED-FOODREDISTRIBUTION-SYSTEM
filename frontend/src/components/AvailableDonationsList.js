// frontend/src/components/AvailableDonationsList.js
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


function AvailableDonationsList({ onClaimSuccess }) {
  const [availableDonations, setAvailableDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [claimConfirmOpen, setClaimConfirmOpen] = useState(false); // State for claim confirmation dialog
  const [donationToClaimId, setDonationToClaimId] = useState(null); // State to hold ID of donation to claim


  const fetchAvailableDonations = async () => {
    try {
      const response = await api.get('donations/available/');
      setAvailableDonations(response.data);
    } catch (err) {
      console.error('Failed to fetch available donations:', err);
      setError('Failed to load available food offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableDonations();
  }, []); // Only fetch on mount for now. A refresh button/callback might be needed later.

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
        setMessage('Donation claimed successfully!');
        setAvailableDonations(prevDonations => prevDonations.filter(d => d.id !== donationToClaimId));
        if (onClaimSuccess) {
          onClaimSuccess(response.data);
        }
        console.log('Donation claimed:', response.data);
        handleClaimConfirmClose(); // Close dialog on success
      } catch (err) {
        console.error('Claiming donation failed:', err.response ? err.response.data : err.message);
        setError(err.response && err.response.data ? JSON.stringify(err.response.data) : 'Failed to claim donation. It might already be claimed or unavailable.');
      }
    }
  };

  if (loading) {
    return <Typography>Loading available food offers...</Typography>;
  }

  if (error) {
    return <Typography color="error.main">{error}</Typography>;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Available Food Offers
      </Typography>
      {message && <Typography color="success.main" sx={{ mb: 2 }}>{message}</Typography>}
      {error && <Typography color="error.main" sx={{ mb: 2 }}>{error}</Typography>}

      {availableDonations.length === 0 ? (
        <Typography>No food donations are currently available. Check back later!</Typography>
      ) : (
        <Grid container spacing={3}>
          {availableDonations.map((donation) => (
            <Grid item xs={12} sm={6} md={4} key={donation.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {donation.image && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={donation.image}
                    alt={donation.description}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {donation.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FastfoodIcon fontSize="small" /> <strong>Quantity:</strong> {donation.quantity} kg
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon fontSize="small" /> <strong>Expires:</strong> {new Date(donation.expiry_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CategoryIcon fontSize="small" /> <strong>Category:</strong> {donation.category_detail ? donation.category_detail.name : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon fontSize="small" /> <strong>Location:</strong> {donation.location ? `${donation.location.city}, ${donation.location.state}` : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong> {donation.status}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleClaimConfirmOpen(donation.id)}
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
            Are you sure you want to claim this food donation?
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

export default AvailableDonationsList;
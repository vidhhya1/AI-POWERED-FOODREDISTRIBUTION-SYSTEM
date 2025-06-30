// frontend/src/components/SenderDonationList.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import FoodDonationForm from './FoodDonationForm';

// Import MUI Components
import {
  Typography, Button, Box, Paper, Grid, Card, CardContent, CardActions,
  CardMedia, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';


function SenderDonationList({ currentUserId, onDonationUpdate, onDonationDelete }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingDonation, setEditingDonation] = useState(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // State for delete confirmation dialog
  const [donationToDeleteId, setDonationToDeleteId] = useState(null); // State to hold ID of donation to delete

  const fetchDonations = async () => {
    try {
      const response = await api.get('donations/');
      const userDonations = response.data.filter(
        (donation) => donation.donor && donation.donor.id === currentUserId
      );
      setDonations(userDonations);
    } catch (err) {
      console.error('Failed to fetch donations:', err);
      setError('Failed to load your donations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchDonations();
    }
  }, [currentUserId, listRefreshKey]);

  const handleDeleteConfirmOpen = (donationId) => {
    setDonationToDeleteId(donationId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
    setDonationToDeleteId(null);
  };

  const handleDelete = async () => {
    if (donationToDeleteId) {
      try {
        await api.delete(`donations/${donationToDeleteId}/`);
        setListRefreshKey(prevKey => prevKey + 1);
        if (onDonationDelete) onDonationDelete(donationToDeleteId);
        handleDeleteConfirmClose(); // Close dialog on success
      } catch (err) {
        console.error('Failed to delete donation:', err.response ? err.response.data : err.message);
        setError('Failed to delete donation. Please try again.');
      }
    }
  };

  const handleEditClick = (donation) => {
    setEditingDonation(donation);
  };

  const handleEditSuccess = (updatedDonation) => {
    setEditingDonation(null);
    setListRefreshKey(prevKey => prevKey + 1);
    if (onDonationUpdate) onDonationUpdate(updatedDonation);
  };

  const handleCancelEdit = () => {
    setEditingDonation(null);
  };

  if (loading) {
    return <Typography>Loading your donations...</Typography>;
  }

  if (error) {
    return <Typography color="error.main">{error}</Typography>;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Your Donations
      </Typography>

      {editingDonation && (
        <Paper elevation={3} sx={{ padding: 4, my: 4 }}>
          <Typography variant="h6" gutterBottom>Edit Donation</Typography>
          <FoodDonationForm
            donationToEdit={editingDonation}
            onDonationSuccess={handleEditSuccess}
            onCancel={handleCancelEdit}
          />
        </Paper>
      )}

      {donations.length === 0 ? (
        <Typography>You have not made any donations yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {donations.map((donation) => (
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
                  <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => handleEditClick(donation)}>
                    Edit
                  </Button>
                  <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteConfirmOpen(donation.id)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteConfirmClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            Are you sure you want to delete this donation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SenderDonationList;
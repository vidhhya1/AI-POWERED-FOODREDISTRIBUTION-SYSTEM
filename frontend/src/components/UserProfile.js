// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import EditProfileForm from './EditProfileForm';

// Import MUI Components
import { Typography, Button, Box, Paper, Avatar, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person'; // Default profile icon


function UserProfile({ currentUserId }) {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get('user/');
      setUserDetails(response.data);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchUserDetails();
    }
  }, [currentUserId, isEditing]);

  const handleEditSuccess = (updatedData) => {
    setUserDetails(updatedData);
    setIsEditing(false);
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return <CircularProgress sx={{ my: 2 }} />;
  }

  if (error) {
    return <Typography color="error.main">{error}</Typography>;
  }

  if (!userDetails) {
    return <Typography>Profile data not found.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ padding: 4, my: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Your Profile
      </Typography>
      {isEditing ? (
        <EditProfileForm
          userDetails={userDetails}
          onEditSuccess={handleEditSuccess}
          onCancel={handleCancelEdit}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {userDetails.profile_image ? (
            <Avatar src={userDetails.profile_image} alt="Profile" sx={{ width: 100, height: 100 }} />
          ) : (
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
          )}
          <Typography variant="h6">{userDetails.username}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {userDetails.email}</Typography>
          {userDetails.phone_number && <Typography variant="body1"><strong>Phone:</strong> {userDetails.phone_number}</Typography>}
          {userDetails.organization_name && <Typography variant="body1"><strong>Organization:</strong> {userDetails.organization_name}</Typography>}
          <Typography variant="body1"><strong>Role:</strong> {userDetails.is_donor ? 'Food Donor (Sender)' : (userDetails.is_requester ? 'Food Receiver (Acceptor)' : 'N/A')}</Typography>
          
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)} sx={{ mt: 2 }}>
            Edit Profile
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default UserProfile;
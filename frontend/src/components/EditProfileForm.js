// frontend/src/components/EditProfileForm.js
import React, { useState, useEffect } from 'react';
import api from '../api';

// Import MUI Components
import { TextField, Button, Box, Typography, Paper, Avatar } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';


function EditProfileForm({ userDetails, onEditSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    organization_name: '',
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userDetails) {
      setFormData({
        username: userDetails.username || '',
        email: userDetails.email || '',
        phone_number: userDetails.phone_number || '',
        organization_name: userDetails.organization_name || '',
      });
    }
  }, [userDetails]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setProfileImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    if (formData.phone_number) data.append('phone_number', formData.phone_number);
    if (formData.organization_name) data.append('organization_name', formData.organization_name);
    
    if (profileImageFile) {
      data.append('profile_image', profileImageFile);
    } 

    try {
      const response = await api.put('user/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Profile updated successfully!');
      if (onEditSuccess) {
        onEditSuccess(response.data);
      }
      console.log('Profile updated:', response.data);
    } catch (err) {
      console.error('Profile update error:', err.response ? err.response.data : err.message);
      setError(err.response && err.response.data ? JSON.stringify(err.response.data) : 'Failed to update profile. Please try again.');
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>Edit Profile Details</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        {userDetails.profile_image ? (
          <Avatar src={userDetails.profile_image} alt="Current Profile" sx={{ width: 80, height: 80 }} />
        ) : (
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
            <PersonIcon sx={{ fontSize: 50 }} />
          </Avatar>
        )}
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Phone Number (Optional)"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Organization Name (Optional)"
          name="organization_name"
          value={formData.organization_name}
          onChange={handleChange}
          fullWidth
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            component="label"
          >
            Upload New Profile Image (Optional)
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </Button>
          {profileImageFile && <Typography>{profileImageFile.name}</Typography>}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />}>Update Profile</Button>
          <Button type="button" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={onCancel}>Cancel</Button>
        </Box>
      </Box>
      {message && <Typography color="success.main" mt={2}>{message}</Typography>}
      {error && <Typography color="error.main" mt={2}>{error}</Typography>}
    </Paper>
  );
}

export default EditProfileForm;
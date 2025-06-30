// frontend/src/components/FoodDonationForm.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import MapInput from './MapInput';

// Import MUI Components
import {
  TextField, Button, Box, Typography, Paper,
  FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns'; // For date pickers, if you want to use them
import LocalizationProvider from '@mui/lab/LocalizationProvider'; // For date pickers
import DatePicker from '@mui/lab/DatePicker'; // For date pickers
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // For upload icon
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // For time frame icon (if needed for form)


function FoodDonationForm({ onDonationSuccess, donationToEdit, onCancel }) {
  const [formData, setFormData] = useState({
    description: '',
    quantity: '',
    expiry_date: null, // Change to null for MUI DatePicker
    tags: '',
    category_name: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [locationData, setLocationData] = useState({
    address_line: '',
    city: '',
    state: '',
    zipcode: '',
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    if (donationToEdit) {
      setFormData({
        description: donationToEdit.description || '',
        quantity: donationToEdit.quantity || '',
        expiry_date: donationToEdit.expiry_date ? new Date(donationToEdit.expiry_date) : null, // Convert to Date object
        tags: donationToEdit.tags || '',
        category_name: donationToEdit.category_detail ? donationToEdit.category_detail.name : '',
      });
      if (donationToEdit.location) {
        setLocationData({
          address_line: donationToEdit.location.address_line || '',
          city: donationToEdit.location.city || '',
          state: donationToEdit.location.state || '',
          zipcode: donationToEdit.location.zipcode || '',
          latitude: donationToEdit.location.latitude ? parseFloat(donationToEdit.location.latitude) : null,
          longitude: donationToEdit.location.longitude ? parseFloat(donationToEdit.location.longitude) : null,
        });
      }
    } else {
      setFormData({
        description: '', quantity: '', expiry_date: null, tags: '', category_name: '',
      });
      setLocationData({
        address_line: '', city: '', state: '', zipcode: '', latitude: null, longitude: null,
      });
      setImageFile(null);
    }
  }, [donationToEdit]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('categories/');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load food categories.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, expiry_date: date });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleLocationSelect = (newLocationData) => {
    setLocationData(newLocationData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!locationData.city || !locationData.state || locationData.latitude === null || locationData.longitude === null) {
      setError('Please select a valid location using the map search or by clicking on the map.');
      return;
    }
    if (!formData.description || !formData.quantity || !formData.expiry_date || !formData.category_name) {
      setError('Please fill in all required form fields.');
      return;
    }

    const data = new FormData();
    data.append('description', formData.description);
    data.append('quantity', formData.quantity);
    data.append('expiry_date', formData.expiry_date.toISOString().split('T')[0]); // Format date for backend (YYYY-MM-DD)
    data.append('category', formData.category_name);

    if (formData.tags) {
      data.append('tags', formData.tags);
    }
    if (imageFile) {
      data.append('image', imageFile);
    }

    const locationJson = JSON.stringify(locationData);
    data.append('location', locationJson);

    try {
      let response;
      if (donationToEdit) {
        response = await api.patch(`donations/${donationToEdit.id}/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Food donation updated successfully!');
      } else {
        response = await api.post('donations/', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Food donation uploaded successfully!');
      }

      setFormData({
        description: '', quantity: '', expiry_date: null, tags: '', category_name: '',
      });
      setImageFile(null);
      setLocationData({
        address_line: '', city: '', state: '', zipcode: '', latitude: null, longitude: null
      });

      if (onDonationSuccess) {
        onDonationSuccess(response.data);
      }
      console.log(donationToEdit ? 'Donation updated:' : 'Donation created:', response.data);
    } catch (err) {
      console.error('Donation operation error:', err.response ? err.response.data : err.message);
      setError(err.response && err.response.data ? JSON.stringify(err.response.data) : 'Operation failed. Please try again.');
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, my: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        {donationToEdit ? 'Edit Food Donation' : 'Upload New Food Donation'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Food Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Quantity (e.g., 5.0 kg)"
          name="quantity"
          type="number"
          inputProps={{ step: "0.1" }}
          value={formData.quantity}
          onChange={handleChange}
          fullWidth
          required
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Expiration Date"
            value={formData.expiry_date}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} fullWidth required />}
          />
        </LocalizationProvider>
        <FormControl fullWidth required>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            name="category_name"
            value={formData.category_name}
            label="Category"
            onChange={handleChange}
          >
            {loadingCategories ? (
              <MenuItem disabled>Loading categories...</MenuItem>
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No categories available. Add in backend admin.</MenuItem>
            )}
          </Select>
          {!loadingCategories && categories.length === 0 && (
            <FormHelperText error>Please add food categories in your Django admin.</FormHelperText>
          )}
        </FormControl>
        <TextField
          label="Tags (comma-separated, e.g., vegetarian,gluten-free)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          fullWidth
        />

        <Typography variant="h6" component="h4" sx={{ mt: 2, mb: 1 }}>Select Location on Map:</Typography>
        <MapInput
            onLocationSelect={handleLocationSelect}
            initialCenter={locationData.latitude && locationData.longitude ? { lat: locationData.latitude, lng: locationData.longitude } : null}
        />

        {locationData.latitude && locationData.longitude && (
            <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px', bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1"><strong>Selected Location:</strong></Typography>
                <Typography>Address: {locationData.address_line || 'N/A'}</Typography>
                <Typography>City: {locationData.city || 'N/A'}</Typography>
                <Typography>State: {locationData.state || 'N/A'}</Typography>
                <Typography>Zipcode: {locationData.zipcode || 'N/A'}</Typography>
                <Typography>Lat: {locationData.latitude.toFixed(4)}, Lng: {locationData.longitude.toFixed(4)}</Typography>
            </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
          >
            Upload Image (Optional)
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </Button>
          {imageFile && <Typography>{imageFile.name}</Typography>}
          {donationToEdit && donationToEdit.image && !imageFile && (
            <Typography>Current Image: <img src={donationToEdit.image} alt="current" style={{ maxWidth: '80px', maxHeight: '80px', verticalAlign: 'middle' }} /></Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button type="submit" variant="contained" color="primary">
            {donationToEdit ? 'Update Donation' : 'Submit Donation'}
          </Button>
          {donationToEdit && (
              <Button type="button" variant="outlined" onClick={onCancel}>Cancel Edit</Button>
          )}
        </Box>
      </Box>
      {message && <Typography color="success.main" mt={2}>{message}</Typography>}
      {error && <Typography color="error.main" mt={2}>{error}</Typography>}
    </Paper>
  );
}

export default FoodDonationForm;
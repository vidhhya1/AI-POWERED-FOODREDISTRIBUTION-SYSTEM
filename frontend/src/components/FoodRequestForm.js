// frontend/src/components/FoodRequestForm.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import MapInput from './MapInput';

// Import MUI Components
import {
  TextField, Button, Box, Typography, Paper,
  FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';

function FoodRequestForm({ onRequestSuccess }) {
  const [formData, setFormData] = useState({
    description: '',
    quantity: '',
    preferred_tags: '',
    category_name: '',
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [locationData, setLocationData] = useState({
    address_line: '', city: '', state: '', zipcode: '', latitude: null, longitude: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('categories/');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load food categories for requests.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (newLocationData) => {
    setLocationData(newLocationData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!locationData.city || !locationData.state || locationData.latitude === null || locationData.longitude === null) {
      setError('Please select a valid location using the map search or by clicking on the map for your request.');
      return;
    }
    if (!formData.description || !formData.quantity || !formData.category_name) {
      setError('Please fill in all required request details.');
      return;
    }

    const data = {
      description: formData.description,
      quantity: parseFloat(formData.quantity),
      category: formData.category_name,
      preferred_tags: formData.preferred_tags,
      location: locationData,
    };

    try {
      const response = await api.post('requests/', data);
      setMessage('Food request submitted successfully!');
      setFormData({
        description: '', quantity: '', preferred_tags: '', category_name: ''
      });
      setLocationData({
        address_line: '', city: '', state: '', zipcode: '', latitude: null, longitude: null
      });

      if (onRequestSuccess) {
        onRequestSuccess(response.data);
      }
      console.log('Request created:', response.data);
    } catch (err) {
      console.error('Food request error:', err.response ? err.response.data : err.message);
      setError(err.response && err.response.data ? JSON.stringify(err.response.data) : 'Failed to submit request. Please try again.');
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, my: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Submit New Food Request
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Request Description (e.g., 'Fruits for 50 people')"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Quantity (e.g., 10.0 kg)"
          name="quantity"
          type="number"
          inputProps={{ step: "0.1" }}
          value={formData.quantity}
          onChange={handleChange}
          fullWidth
          required
        />
        <FormControl fullWidth required>
          <InputLabel id="req-category-select-label">Category</InputLabel>
          <Select
            labelId="req-category-select-label"
            id="req-category-select"
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
          label="Preferred Tags (comma-separated, e.g., gluten-free,vegan)"
          name="preferred_tags"
          value={formData.preferred_tags}
          onChange={handleChange}
          fullWidth
        />

        <Typography variant="h6" component="h4" sx={{ mt: 2, mb: 1 }}>Your Request Location:</Typography>
        <MapInput onLocationSelect={handleLocationSelect} />

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

        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
          Submit Request
        </Button>
      </Box>
      {message && <Typography color="success.main" mt={2}>{message}</Typography>}
      {error && <Typography color="error.main" mt={2}>{error}</Typography>}
    </Paper>
  );
}

export default FoodRequestForm;
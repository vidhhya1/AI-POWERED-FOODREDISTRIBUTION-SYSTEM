// frontend/src/components/DemandSubmissionForm.js
import React, { useState } from 'react';
import api from '../api';
import MapInput from './MapInput';

// Import MUI Components
import {
  TextField, Button, Box, Typography, Paper,
  FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';


function DemandSubmissionForm({ onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    demand_type: '',
    quantity_needed: '',
    time_frame: '',
    description: '',
  });
  const [locationData, setLocationData] = useState({
    address_line: '', city: '', state: '', zipcode: '', latitude: null, longitude: null,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

    if (!locationData.city || !locationData.state) {
      setError('Please select a location for your demand data.');
      return;
    }
    if (!formData.demand_type || !formData.quantity_needed || !formData.time_frame || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const dataToSend = {
        demand_type: formData.demand_type,
        quantity_needed: parseFloat(formData.quantity_needed),
        time_frame: formData.time_frame,
        description: formData.description,
        location: locationData,
      };

      const response = await api.post('demand/submit/', dataToSend);
      setMessage('Demand data submitted successfully!');
      setFormData({ demand_type: '', quantity_needed: '', time_frame: '', description: '' });
      setLocationData({ address_line: '', city: '', state: '', zipcode: '', latitude: null, longitude: null });
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
      console.log('Demand data submitted:', response.data);
    } catch (err) {
      console.error('Demand submission error:', err.response ? err.response.data : err.message);
      setError(err.response && err.response.data ? JSON.stringify(err.response.data) : 'Failed to submit demand data. Please try again.');
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, my: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Submit Demand Data
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Help improve demand forecasts by submitting data about food needed in your area.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth required>
          <InputLabel id="demand-type-label">Demand Type</InputLabel>
          <Select
            labelId="demand-type-label"
            id="demand-type-select"
            name="demand_type"
            value={formData.demand_type}
            label="Demand Type"
            onChange={handleChange}
          >
            <MenuItem value="">Select Type</MenuItem>
            <MenuItem value="urgent">Urgent Need</MenuItem>
            <MenuItem value="regular">Regular Need</MenuItem>
            <MenuItem value="event">Event Specific</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Quantity Needed (kg)"
          name="quantity_needed"
          type="number"
          inputProps={{ step: "0.1" }}
          value={formData.quantity_needed}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Time Frame (e.g., 'Next Week', 'Today')"
          name="time_frame"
          value={formData.time_frame}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Description (e.g., 'For school lunch program')"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          required
        />

        <Typography variant="h6" component="h4" sx={{ mt: 2, mb: 1 }}>Location for Demand:</Typography>
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

        <Button type="submit" variant="contained" color="primary" startIcon={<SendIcon />} sx={{ mt: 3 }}>
          Submit Demand Data
        </Button>
      </Box>
      {message && <Typography color="success.main" mt={2}>{message}</Typography>}
      {error && <Typography color="error.main" mt={2}>{error}</Typography>}
    </Paper>
  );
}

export default DemandSubmissionForm;
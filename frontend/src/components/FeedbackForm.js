// frontend/src/components/FeedbackForm.js
import React, { useState } from 'react';
import api from '../api';

// Import MUI Components
import {
  TextField, Button, Box, Typography, Paper,
  FormControl, InputLabel, Select, MenuItem, Rating as MuiRating // Rename Rating to avoid conflict
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';


function FeedbackForm({ claimedDonationId, onFeedbackSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    rating: 5,
    comments: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRatingChange = (event, newValue) => {
    setFormData({ ...formData, rating: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const dataToSend = {
        claimed_donation: claimedDonationId,
        rating: parseInt(formData.rating),
        comments: formData.comments,
      };

      const response = await api.post('feedback/', dataToSend);
      setMessage('Feedback submitted successfully!');
      setFormData({ rating: 5, comments: '' });
      if (onFeedbackSuccess) {
        onFeedbackSuccess(response.data);
      }
      console.log('Feedback submitted:', response.data);
    } catch (err) {
      console.error('Feedback submission failed:', err.response ? err.response.data : err.message);
      setError(err.response && err.response.data ? JSON.stringify(err.response.data) : 'Failed to submit feedback. You might have already submitted feedback for this claim.');
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" component="h4" gutterBottom>Submit Feedback</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="legend">Rating:</Typography>
          <MuiRating // Use MuiRating here
            name="rating"
            value={parseInt(formData.rating)}
            onChange={handleRatingChange}
            required
          />
          <Typography variant="body2" color="text.secondary">({formData.rating} Stars)</Typography>
        </Box>
        <TextField
          label="Comments (Optional)"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          placeholder="Share your experience..."
        />
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button type="submit" variant="contained" startIcon={<SendIcon />}>Submit Feedback</Button>
          <Button type="button" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={onCancel}>Cancel</Button>
        </Box>
      </Box>
      {message && <Typography color="success.main" mt={1}>{message}</Typography>}
      {error && <Typography color="error.main" mt={1}>{error}</Typography>}
    </Paper>
  );
}

export default FeedbackForm;
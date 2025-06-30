// frontend/src/components/RegistrationForm.js
import React, { useState } from 'react';
import api from '../api';

// Import MUI Components
import { TextField, Button, Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'donor'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const dataToSend = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        is_donor: formData.role === 'donor',
        is_requester: formData.role === 'requester'
      };

      const response = await api.post(`register/`, dataToSend);
      setMessage('Registration successful! Please log in.');
      setFormData({
        username: '', email: '', password: '', password2: '', role: 'donor'
      });
      console.log(response.data);
    } catch (err) {
      console.error('Registration error:', err.response ? err.response.data : err.message);
      setError(err.response && err.response.data ? JSON.stringify(err.response.data) : 'Registration failed. Please try again.');
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Register
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="reg-username"
          label="Username"
          name="username"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="reg-email"
          label="Email Address"
          name="email"
          autoComplete="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="reg-password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password2"
          label="Confirm Password"
          type="password"
          id="reg-password2"
          autoComplete="new-password"
          value={formData.password2}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="role-select-label">Register as</InputLabel>
          <Select
            labelId="role-select-label"
            id="role-select"
            name="role"
            value={formData.role}
            label="Register as"
            onChange={handleChange}
          >
            <MenuItem value="donor">Food Donor (Sender)</MenuItem>
            <MenuItem value="requester">Food Receiver (Acceptor)</MenuItem>
          </Select>
        </FormControl>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Register
        </Button>
      </Box>
      {message && <Typography color="success.main" mt={1}>{message}</Typography>}
      {error && <Typography color="error.main" mt={1}>{error}</Typography>}
    </Paper>
  );
}

export default RegistrationForm;
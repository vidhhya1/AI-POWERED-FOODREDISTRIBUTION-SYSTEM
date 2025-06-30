// frontend/src/components/LoginForm.js
import React, { useState } from 'react';
import api from '../api';

// Import MUI Components
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

function LoginForm({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await api.post(`token/`, {
        username: formData.username,
        password: formData.password,
      });

      const { access, refresh } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setMessage('Login successful!');
      setFormData({ username: '', password: '' });

      if (onLoginSuccess) {
        onLoginSuccess();
      }
      console.log('Login successful:', response.data);
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err.message);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          value={formData.username}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Login
        </Button>
      </Box>
      {message && <Typography color="success.main" mt={1}>{message}</Typography>}
      {error && <Typography color="error.main" mt={1}>{error}</Typography>}
    </Paper>
  );
}

export default LoginForm;
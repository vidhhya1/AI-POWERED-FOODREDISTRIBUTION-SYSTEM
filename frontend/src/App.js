// frontend/src/App.js
import React, { useState, useEffect } from 'react';
// import './App.css'; // You might eventually remove or simplify this if MUI handles most styling
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'; // Import MUI components

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowRegistration(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}> {/* Use Box for overall container */}
      <AppBar position="static" color="primary"> {/* Use AppBar for header */}
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI-Powered Food Redistribution System
          </Typography>
          {isAuthenticated ? (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button color="inherit" onClick={() => setShowRegistration(!showRegistration)}>
              {showRegistration ? 'Login' : 'Register'}
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <main style={{ padding: '20px' }}> {/* Basic padding for content */}
        {isAuthenticated ? (
          <Dashboard />
        ) : (
          <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}> {/* Center forms */}
            {showRegistration ? (
              <RegistrationForm />
            ) : (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            )}
          </Box>
        )}
      </main>
    </Box>
  );
}

export default App;
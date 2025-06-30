// frontend/src/components/DemandForecast.js
import React, { useState, useEffect } from 'react';
import api from '../api';

// Import MUI Components
import { Typography, Box, Paper, LinearProgress } from '@mui/material';

function DemandForecast() {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await api.get('demand/forecast/');
        setForecastData(response.data);
        console.log('Demand Forecast:', response.data);
      } catch (err) {
        console.error('Failed to fetch demand forecast:', err.response ? err.response.data : err.message);
        setError('Failed to load demand forecast. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  if (loading) {
    return <LinearProgress sx={{ my: 2 }} />;
  }

  if (error) {
    return <Typography color="error.main">{error}</Typography>;
  }

  if (!forecastData || Object.keys(forecastData).length === 0) {
    return <Typography>No demand forecast data available yet.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ padding: 4, my: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Demand Forecast
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        This section shows predicted food demand in various areas or for certain categories.
      </Typography>

      {Object.keys(forecastData).length > 0 && (
        <Box sx={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Typography variant="h6" component="h4" gutterBottom>General Forecast Insights:</Typography>
          {Object.entries(forecastData).map(([key, value]) => (
            <Typography key={key} sx={{ mb: 1 }}>
              <strong>{key}:</strong> {JSON.stringify(value)}
            </Typography>
          ))}
          <Typography variant="caption" display="block" sx={{ mt: 2, fontStyle: 'italic' }}>
            *(Note: The display above is a placeholder. You'll need to adapt it
            based on the actual structure of data returned by your
            `/api/demand/forecast/`)*
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default DemandForecast;
// frontend/src/components/ReceiverRequestList.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import RequestMatches from './RequestMatches';

// Import MUI Components
import {
  Typography, Button, Box, Grid, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';


function ReceiverRequestList({ currentUserId, onClaimSuccess }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const fetchRequests = async () => {
    try {
      const response = await api.get('requests/');
      const userRequests = response.data.filter(
        (request) => request.requester && request.requester.id === currentUserId
      );
      setRequests(userRequests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load your food requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchRequests();
    }
  }, [currentUserId, refreshKey]);

  const handleViewMatchesClick = (requestId) => {
    setSelectedRequestId(requestId);
  };

  const handleBackToRequests = () => {
    setSelectedRequestId(null);
    setRefreshKey(prevKey => prevKey + 1); // Optionally refresh list when returning
  };

  if (loading) {
    return <Typography>Loading your food requests...</Typography>;
  }

  if (error) {
    return <Typography color="error.main">{error}</Typography>;
  }

  if (selectedRequestId) {
    return <RequestMatches requestId={selectedRequestId} onBackToList={handleBackToRequests} onClaimSuccess={onClaimSuccess} />;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Your Food Requests
      </Typography>

      {requests.length === 0 ? (
        <Typography>You have not submitted any food requests yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {requests.map((request) => (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {request.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FastfoodIcon fontSize="small" /> <strong>Quantity:</strong> {request.quantity} kg
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CategoryIcon fontSize="small" /> <strong>Category:</strong> {request.category_detail ? request.category_detail.name : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Preferred Tags:</strong> {request.preferred_tags || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong> {request.status}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon fontSize="small" /> <strong>Location:</strong> {request.location ? `${request.location.city}, ${request.location.state}` : 'N/A'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" startIcon={<SearchIcon />} onClick={() => handleViewMatchesClick(request.id)}>
                    View Matches
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default ReceiverRequestList;
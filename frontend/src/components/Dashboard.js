// src/components/Dashboard.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import FoodDonationForm from './FoodDonationForm';
import SenderDonationList from './SenderDonationList';
import AvailableDonationsList from './AvailableDonationsList';
import FoodRequestForm from './FoodRequestForm';
import ReceiverRequestList from './ReceiverRequestList';
import ClaimedDonationsList from './ClaimedDonationsList';
import DemandForecast from './DemandForecast';
import DemandSubmissionForm from './DemandSubmissionForm';
import UserProfile from './UserProfile'; // Import the new UserProfile component

function Dashboard() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDemandSubmissionForm, setShowDemandSubmissionForm] = useState(false);
  const [showDemandForecast, setShowDemandForecast] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false); // New state for UserProfile
  const [message, setMessage] = useState('');

  const claimedDonationsListRef = useRef();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get('user/');
        setUserDetails(response.data);
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        setError('Failed to load user data. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleDonationSuccess = (newDonation) => {
    setMessage('Donation uploaded successfully!');
    setShowDonationForm(false);
  };

  const handleRequestSuccess = (newRequest) => {
    setMessage('Food request submitted successfully!');
    setShowRequestForm(false);
  };

  const handleClaimSuccess = (claimedDonation) => {
    setMessage('Donation claimed successfully! Check your claimed donations list.');
    if (claimedDonationsListRef.current) {
        claimedDonationsListRef.current.refreshList();
    }
  };

  const handleDemandSubmitSuccess = (submittedData) => {
    setMessage('Demand data submitted successfully!');
    setShowDemandSubmissionForm(false);
  };

  const handleUserProfileToggle = () => {
    // Hide other forms when opening profile
    setShowDonationForm(false);
    setShowRequestForm(false);
    setShowDemandSubmissionForm(false);
    setShowDemandForecast(false);
    setMessage(''); // Clear any previous messages
    setShowUserProfile(!showUserProfile);
  };

  if (loading) {
    return <p>Loading user data...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!userDetails) {
    return <p>User data not found. Please log in.</p>;
  }

  let userRoleDisplay = 'Unknown';
  let userRole = 'unknown';

  if (userDetails.is_donor) {
    userRoleDisplay = 'Food Donor (Sender)';
    userRole = 'sender';
  } else if (userDetails.is_requester) {
    userRoleDisplay = 'Food Receiver (Acceptor)';
    userRole = 'receiver';
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Welcome, {userDetails.username}!</h2>
        <p>Your Role: {userRoleDisplay}</p>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        <button onClick={handleUserProfileToggle} style={{ marginLeft: '20px' }}>
          {showUserProfile ? 'Hide Profile' : 'View/Edit Profile'}
        </button>
      </header>

      <main className="dashboard-content">
        {showUserProfile && <UserProfile currentUserId={userDetails.id} />}

        {!showUserProfile && userRole === 'sender' && (
          <div className="sender-dashboard">
            <h3>Sender Dashboard</h3>
            <p>As a food donor, you can:</p>
            <ul>
              <li>Upload new food donations</li>
              <li>View your active and past donations</li>
              <li>Track claims on your donations</li>
            </ul>
            <button onClick={() => {
              setShowDonationForm(!showDonationForm);
              setMessage('');
            }}>
              {showDonationForm ? 'Hide Donation Form' : 'Upload New Donation'}
            </button>

            {showDonationForm && <FoodDonationForm onDonationSuccess={handleDonationSuccess} />}

            <SenderDonationList currentUserId={userDetails.id} />
          </div>
        )}

        {!showUserProfile && userRole === 'receiver' && (
          <div className="receiver-dashboard">
            <h3>Receiver Dashboard</h3>
            <p>As a food receiver, you can:</p>
            <ul>
              <li>Browse available food donations</li>
              <li>Submit food requests</li>
              <li>View potential matches for your requests</li>
              <li>Manage your claimed donations and provide feedback</li>
            </ul>

            <div style={{ marginBottom: '20px' }}>
              <button onClick={() => {
                setShowRequestForm(!showRequestForm);
                setMessage('');
                setShowDemandSubmissionForm(false);
                setShowDemandForecast(false);
              }} style={{ marginRight: '10px' }}>
                {showRequestForm ? 'Hide Request Form' : 'Submit New Food Request'}
              </button>

              <button onClick={() => {
                setShowDemandSubmissionForm(!showDemandSubmissionForm);
                setMessage('');
                setShowRequestForm(false);
                setShowDemandForecast(false);
              }} style={{ marginRight: '10px' }}>
                {showDemandSubmissionForm ? 'Hide Demand Form' : 'Submit Demand Data'}
              </button>

              <button onClick={() => {
                setShowDemandForecast(!showDemandForecast);
                setMessage('');
                setShowRequestForm(false);
                setShowDemandSubmissionForm(false);
              }}>
                {showDemandForecast ? 'Hide Demand Forecast' : 'View Demand Forecast'}
              </button>
            </div>

            {showRequestForm && <FoodRequestForm onRequestSuccess={handleRequestSuccess} />}
            {showDemandSubmissionForm && <DemandSubmissionForm onSubmitSuccess={handleDemandSubmitSuccess} />}
            {showDemandForecast && <DemandForecast />}

            <h4>Your Activities:</h4>
            <ReceiverRequestList currentUserId={userDetails.id} onClaimSuccess={handleClaimSuccess} />
            <AvailableDonationsList onClaimSuccess={handleClaimSuccess} />
            <ClaimedDonationsList currentUserId={userDetails.id} ref={claimedDonationsListRef} />
          </div>
        )}

        {!showUserProfile && userRole === 'unknown' && (
          <div className="unknown-role">
            <h3>Welcome!</h3>
            <p>Your role could not be determined. Please contact support or update your profile.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
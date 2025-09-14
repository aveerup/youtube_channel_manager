import React from 'react';
import './Dashboard.css';
import VideoDragDrop from './VideoDragDrop';

const Dashboard = ({ user, onLogout }) => {
  const handleVideoSelect = (videoPath) => {
    console.log('Selected video path:', videoPath);
    // Handle the video path here
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
      
      <div className="user-profile">
        <div className="profile-card">
          <img 
            src={user.photo} 
            alt="Profile" 
            className="profile-photo"
          />
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p className="email">{user.email}</p>
            <p className="user-id">User ID: {user.id}</p>
          </div>
        </div>
        
        <div className="welcome-message">
          <h3>🎉 Authentication Successful!</h3>
          <p>You have successfully logged in with Google OAuth 2.0</p>
          <div className="features">
            <div className="feature">
              <span className="checkmark">✅</span>
              <span>Secure Authentication</span>
            </div>
            <div className="feature">
              <span className="checkmark">✅</span>
              <span>Session Management</span>
            </div>
            <div className="feature">
              <span className="checkmark">✅</span>
              <span>Profile Information</span>
            </div>
          </div>
        </div>
      </div>
      <VideoDragDrop onVideoSelect={handleVideoSelect} />
    </div>
  );
};

export default Dashboard;

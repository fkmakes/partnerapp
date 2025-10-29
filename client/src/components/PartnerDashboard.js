import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function PartnerDashboard() {
  const navigate = useNavigate();
  const partner = JSON.parse(localStorage.getItem('partner') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('partner');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Partner Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="dashboard-content">
        <p>Welcome, <strong>{partner.userid}</strong>!</p>
        <p>This is the partner dashboard.</p>
      </div>
    </div>
  );
}

export default PartnerDashboard;

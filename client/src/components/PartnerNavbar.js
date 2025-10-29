import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PartnerNavbar.css';

function PartnerNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleHome = () => {
    navigate('/partner/home');
  };

  return (
    <nav className="partner-navbar">
      <div className="partner-navbar-content">
        <div className="partner-navbar-brand" onClick={handleHome}>
          <span className="brand-icon">🏪</span>
          <span className="brand-text">Partner Portal</span>
        </div>
        <button className="partner-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default PartnerNavbar;

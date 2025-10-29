import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PartnerNavbar from './PartnerNavbar';
import './PartnerHome.css';

function PartnerHome() {
  const navigate = useNavigate();
  const [partnerInfo, setPartnerInfo] = useState(null);

  useEffect(() => {
    // Get partner info from session storage
    const partner = JSON.parse(sessionStorage.getItem('partner') || '{}');
    setPartnerInfo(partner);
  }, []);

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="partner-container">
      <PartnerNavbar />
      <div className="partner-content">
        <div className="partner-welcome">
          <h1>Welcome, {partnerInfo?.partner_name || 'Partner'}</h1>
          <p className="partner-subtitle">ID: {partnerInfo?.userid}</p>
        </div>

        <div className="partner-dashboard-grid">
          {/* Create Sale Card - Most Important */}
          <div
            className="partner-card partner-card-primary"
            onClick={() => handleCardClick('/partner/create-sale')}
          >
            <div className="card-icon primary">🛒</div>
            <div className="card-content">
              <h2>Create Sale</h2>
              <p>Quick POS Sale</p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {/* Create Order Card */}
          <div
            className="partner-card partner-card-secondary"
            onClick={() => handleCardClick('/partner/create-order')}
          >
            <div className="card-icon secondary">📦</div>
            <div className="card-content">
              <h2>Create Order</h2>
              <p>Place New Order</p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {/* View Orders Card */}
          <div
            className="partner-card partner-card-info"
            onClick={() => handleCardClick('/partner/orders')}
          >
            <div className="card-icon info">📋</div>
            <div className="card-content">
              <h2>View Orders</h2>
              <p>Track Your Orders</p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {/* View Stock Card */}
          <div
            className="partner-card partner-card-info"
            onClick={() => handleCardClick('/partner/view-stock')}
          >
            <div className="card-icon info">📊</div>
            <div className="card-content">
              <h2>View Stock</h2>
              <p>Current Inventory</p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {/* Sales Analytics Card */}
          <div
            className="partner-card partner-card-analytics"
            onClick={() => handleCardClick('/partner/sales-analytics')}
          >
            <div className="card-icon analytics">📈</div>
            <div className="card-content">
              <h2>Sales Analytics</h2>
              <p>View Performance</p>
            </div>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartnerHome;

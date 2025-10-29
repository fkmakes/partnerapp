import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const partner = JSON.parse(localStorage.getItem('partner') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('partner');
    navigate('/');
  };

  const menuItems = [
    { path: '/admin-dashboard', label: 'Home', icon: '🏠' },
    { path: '/add-partner', label: 'Add Partner', icon: '➕' },
    { path: '/partners', label: 'Partners', icon: '👥' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/orders', label: 'Orders', icon: '📋' },
  ];

  return (
    <div className="navbar">
      <div className="navbar-header">
        <h2>Partner App</h2>
        <p className="navbar-user">{partner.userid}</p>
      </div>

      <nav className="navbar-menu">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="navbar-footer">
        <button onClick={handleLogout} className="logout-btn-nav">
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;

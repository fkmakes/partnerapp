import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './AdminHome.css';

function AdminHome() {
  const navigate = useNavigate();
  const partner = JSON.parse(localStorage.getItem('partner') || '{}');

  const cards = [
    {
      title: 'Create Order',
      description: 'Create new orders for partners',
      icon: '🛒',
      path: '/create-order',
      color: '#f093fb'
    },
    {
      title: 'Add Partner',
      description: 'Create new partner accounts',
      icon: '➕',
      path: '/add-partner',
      color: '#667eea'
    },
    {
      title: 'View Partners',
      description: 'View all registered partners',
      icon: '👥',
      path: '/partners',
      color: '#764ba2'
    },
    {
      title: 'Add Product',
      description: 'Add new products to inventory',
      icon: '📦',
      path: '/add-product',
      color: '#00d2ff'
    },
    {
      title: 'View Products',
      description: 'View all products and inventory',
      icon: '📋',
      path: '/products',
      color: '#3a7bd5'
    },
    {
      title: 'Reports',
      description: 'View analytics and reports',
      icon: '📊',
      path: '/reports',
      color: '#f59e0b'
    },
    {
      title: 'Settings',
      description: 'Manage system settings',
      icon: '⚙️',
      path: '/settings',
      color: '#4facfe'
    }
  ];

  return (
    <div className="admin-container">
      <Navbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Welcome, {partner.userid}!</h1>
          <p>Select an option below to get started</p>
        </div>

        <div className="cards-grid">
          {cards.map((card, index) => (
            <div
              key={index}
              className="card"
              style={{ borderTop: `4px solid ${card.color}` }}
              onClick={() => navigate(card.path)}
            >
              <div className="card-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminHome;

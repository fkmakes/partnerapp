import React, { useState } from 'react';
import Navbar from './Navbar';
import './AddPartner.css';

function AddPartner() {
  const [formData, setFormData] = useState({
    partnerName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.partner);
        setFormData({
          partnerName: '',
          email: '',
          phone: '',
          address: ''
        });
      } else {
        setError(data.message || 'Failed to create partner');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <Navbar />
      <div className="admin-content">
        <div className="form-container">
          <h1>Add New Partner</h1>
          <p className="form-subtitle">Create a new partner account and generate credentials</p>

          {error && <div className="alert alert-error">{error}</div>}

          {success && (
            <div className="alert alert-success">
              <h3>Partner Created Successfully!</h3>
              <div className="credentials-box">
                <p><strong>Partner Name:</strong> {success.partnerName}</p>
                <p><strong>User ID:</strong> <span className="credential">{success.userid}</span></p>
                <p><strong>Password:</strong> <span className="credential">{success.password}</span></p>
                <p><strong>Email:</strong> {success.email}</p>
                <p><strong>Phone:</strong> {success.phone}</p>
              </div>
              <p className="warning-text">⚠️ Please save these credentials. The password cannot be retrieved later.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="partner-form">
            <div className="form-group">
              <label htmlFor="partnerName">Partner Name *</label>
              <input
                type="text"
                id="partnerName"
                name="partnerName"
                value={formData.partnerName}
                onChange={handleChange}
                required
                placeholder="Enter partner name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                rows="3"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating Partner...' : 'Create Partner'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPartner;

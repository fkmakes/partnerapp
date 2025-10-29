import React, { useState } from 'react';
import Navbar from './Navbar';
import './AddProduct.css';

function AddProduct() {
  const [formData, setFormData] = useState({
    productName: '',
    partnerPrice: '',
    mrp: '',
    initialStock: ''
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
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.product);
        setFormData({
          productName: '',
          partnerPrice: '',
          mrp: '',
          initialStock: ''
        });
      } else {
        setError(data.message || 'Failed to create product');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <Navbar />
      <div className="admin-content">
        <div className="form-container">
          <h1>Add New Product</h1>
          <p className="subtitle">Add a new product to the inventory</p>

          {error && <div className="error-message">{error}</div>}

          {success && (
            <div className="success-message">
              <h3>✓ Product Added Successfully!</h3>
              <div className="product-details">
                <p><strong>Product Name:</strong> {success.productName}</p>
                <p><strong>Partner Price:</strong> ₹{success.partnerPrice}</p>
                <p><strong>MRP:</strong> ₹{success.mrp}</p>
                <p><strong>Initial Stock:</strong> {success.currentStock} units</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="add-form">
            <div className="form-group">
              <label htmlFor="productName">Product Name *</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="partnerPrice">Price to Partner (₹) *</label>
                <input
                  type="number"
                  id="partnerPrice"
                  name="partnerPrice"
                  value={formData.partnerPrice}
                  onChange={handleChange}
                  placeholder="Enter partner price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mrp">MRP (₹) *</label>
                <input
                  type="number"
                  id="mrp"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  placeholder="Enter MRP"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="initialStock">Initial Stock *</label>
              <input
                type="number"
                id="initialStock"
                name="initialStock"
                value={formData.initialStock}
                onChange={handleChange}
                placeholder="Enter initial stock quantity"
                min="0"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating Product...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;

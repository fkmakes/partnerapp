import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './ViewProducts.css';

function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    partnerPrice: '',
    mrp: '',
    currentStock: '',
    stockAdjustment: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditForm({
      partnerPrice: product.partner_price,
      mrp: product.mrp,
      currentStock: product.current_stock,
      stockAdjustment: 0
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    setEditForm({
      partnerPrice: '',
      mrp: '',
      currentStock: '',
      stockAdjustment: 0
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStockAdjustment = (adjustment) => {
    const newStock = parseInt(editForm.currentStock) + adjustment;
    if (newStock >= 0) {
      setEditForm(prev => ({
        ...prev,
        currentStock: newStock,
        stockAdjustment: 0
      }));
    }
  };

  const handleSaveProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partnerPrice: parseFloat(editForm.partnerPrice),
          mrp: parseFloat(editForm.mrp),
          currentStock: parseInt(editForm.currentStock)
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Product updated successfully');
        closeEditModal();
        fetchProducts();
      } else {
        alert(data.message || 'Failed to update product');
      }
    } catch (err) {
      alert('An error occurred while updating the product');
    }
  };

  return (
    <div className="admin-container">
      <Navbar />
      <div className="admin-content">
        <div className="products-header">
          <h1>Products</h1>
          <p className="subtitle">View all products and inventory status</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>No products found. Add your first product to get started!</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <h3>{product.product_name}</h3>
                  <span className="product-id">ID: {product.id}</span>
                </div>

                <div className="product-pricing">
                  <div className="price-item">
                    <span className="price-label">Partner Price</span>
                    <span className="price-value">₹{parseFloat(product.partner_price).toFixed(2)}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">MRP</span>
                    <span className="price-value mrp">₹{parseFloat(product.mrp).toFixed(2)}</span>
                  </div>
                </div>

                <div className="product-stats">
                  <div className="stat-item">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                      <span className="stat-label">Current Stock</span>
                      <span className="stat-value">{product.current_stock} units</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                      <span className="stat-label">Pending Orders</span>
                      <span className="stat-value">{product.pending_orders || 0} orders ({product.pending_units || 0} units)</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-info">
                      <span className="stat-label">In Circulation</span>
                      <span className="stat-value">{product.in_circulation || 0} units</span>
                    </div>
                  </div>
                </div>

                <div className="product-footer">
                  <span className="created-date">
                    Added: {new Date(product.created_at).toLocaleDateString()}
                  </span>
                  <button
                    className="edit-product-btn"
                    onClick={() => openEditModal(product)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="product-modal-overlay" onClick={closeEditModal}>
          <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="product-modal-header">
              <h2>Edit Product</h2>
              <button className="modal-close-btn" onClick={closeEditModal}>×</button>
            </div>

            <div className="product-modal-body">
              <div className="edit-product-info">
                <h3>{selectedProduct.product_name}</h3>
                <p className="product-id-modal">Product ID: {selectedProduct.id}</p>
              </div>

              <div className="edit-form-section">
                <h4>Pricing</h4>
                <div className="edit-form-row">
                  <div className="edit-form-group">
                    <label>Partner Price</label>
                    <input
                      type="number"
                      className="edit-input"
                      value={editForm.partnerPrice}
                      onChange={(e) => handleEditFormChange('partnerPrice', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="edit-form-group">
                    <label>MRP</label>
                    <input
                      type="number"
                      className="edit-input"
                      value={editForm.mrp}
                      onChange={(e) => handleEditFormChange('mrp', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="edit-form-section">
                <h4>Stock Management</h4>
                <div className="stock-management">
                  <div className="current-stock-display">
                    <label>Current Stock</label>
                    <div className="stock-value">{editForm.currentStock} units</div>
                  </div>

                  <div className="stock-adjustment">
                    <label>Adjust Stock</label>
                    <div className="adjustment-controls">
                      <input
                        type="number"
                        className="adjustment-input"
                        value={editForm.stockAdjustment}
                        onChange={(e) => handleEditFormChange('stockAdjustment', parseInt(e.target.value) || 0)}
                        placeholder="Enter amount"
                      />
                      <button
                        className="adjustment-btn add-btn"
                        onClick={() => handleStockAdjustment(parseInt(editForm.stockAdjustment) || 0)}
                      >
                        Add
                      </button>
                      <button
                        className="adjustment-btn subtract-btn"
                        onClick={() => handleStockAdjustment(-(parseInt(editForm.stockAdjustment) || 0))}
                      >
                        Subtract
                      </button>
                    </div>
                  </div>

                  <div className="direct-stock-edit">
                    <label>Or Set Directly</label>
                    <input
                      type="number"
                      className="edit-input"
                      value={editForm.currentStock}
                      onChange={(e) => handleEditFormChange('currentStock', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="product-modal-footer">
                <button className="cancel-modal-btn" onClick={closeEditModal}>
                  Cancel
                </button>
                <button className="save-modal-btn" onClick={handleSaveProduct}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewProducts;

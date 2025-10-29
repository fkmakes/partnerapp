import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './CreateOrder.css';

function CreateOrder() {
  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    partnerId: '',
    deliveryDate: '',
    deliveryChannel: 'Pickup'
  });
  const [orderItems, setOrderItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchPartners();
    fetchProducts();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      const data = await response.json();
      if (data.success) {
        setPartners(data.partners);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openModal = () => {
    setShowModal(true);
    setSelectedProduct('');
    setQuantity(1);
    setDiscount(0);
    setSearchTerm('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct('');
    setQuantity(1);
    setDiscount(0);
    setSearchTerm('');
  };

  const addProductItem = () => {
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProduct));

    // Check if product already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct);

    if (existingItemIndex !== -1) {
      // Update existing item - add quantity and update discount
      const newItems = [...orderItems];
      newItems[existingItemIndex].quantity = parseInt(newItems[existingItemIndex].quantity) + parseInt(quantity);
      newItems[existingItemIndex].discount = discount;
      setOrderItems(newItems);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          productId: selectedProduct,
          productName: product.product_name,
          price: product.partner_price,
          quantity: quantity,
          discount: discount
        }
      ]);
    }

    closeModal();
  };

  const removeProduct = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const updateOrderItem = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const getFilteredProducts = () => {
    if (!searchTerm) return products;
    return products.filter(p =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const itemTotal = (parseFloat(item.price) - parseFloat(item.discount || 0)) * parseInt(item.quantity || 1);
      return total + itemTotal;
    }, 0);
  };

  const calculateItemTotal = (item) => {
    return (parseFloat(item.price) - parseFloat(item.discount || 0)) * parseInt(item.quantity || 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    if (!formData.partnerId || orderItems.length === 0) {
      setError('Please select a partner and add at least one product');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: formData.partnerId,
          products: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            discount: item.discount
          })),
          deliveryDate: formData.deliveryDate,
          deliveryChannel: formData.deliveryChannel
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.order);
        setFormData({
          partnerId: '',
          deliveryDate: '',
          deliveryChannel: 'Pickup'
        });
        setOrderItems([]);
      } else {
        setError(data.message || 'Failed to create order');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewOrder = () => {
    setSuccess(null);
    setError('');
    setFormData({
      partnerId: '',
      deliveryDate: '',
      deliveryChannel: 'Pickup'
    });
    setOrderItems([]);
  };

  return (
    <div className="admin-container">
      <Navbar />
      <div className="admin-content">
        <div className="form-container">
          <h1>Create Order</h1>
          <p className="subtitle">Create a new order for a partner</p>

          {error && <div className="error-message">{error}</div>}

          {success && (
            <div className="success-message">
              <h3>Order Created Successfully!</h3>
              <div className="order-details">
                <p><strong>Order ID:</strong> {success.orderId}</p>
                <p><strong>Total Amount:</strong> ₹{parseFloat(success.totalAmount).toFixed(2)}</p>
                <p><strong>Delivery Date:</strong> {new Date(success.deliveryDate).toLocaleDateString()}</p>
                <p><strong>Channel:</strong> {success.deliveryChannel}</p>
              </div>
              <button type="button" className="create-new-order-btn" onClick={handleCreateNewOrder}>
                Create New Order
              </button>
            </div>
          )}

          {!success && <form onSubmit={handleSubmit} className="add-form">
            {/* Partner Selection */}
            <div className="form-section">
              <div className="section-header-bar">
                <h3>Partner Information</h3>
              </div>
              <div className="section-body">
                <div className="form-group">
                  <label htmlFor="partnerId">Select Partner *</label>
                  <select
                    id="partnerId"
                    name="partnerId"
                    value={formData.partnerId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Partner --</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.partner_name} ({partner.userid})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="form-section">
              <div className="section-header-bar">
                <h3>Order Items</h3>
              </div>
              <div className="section-body">
                <div className="order-items-list">
                  {orderItems.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <div className="item-info">
                        <div className="item-name">{item.productName}</div>
                        <div className="item-price">₹{parseFloat(item.price).toFixed(2)} per unit</div>
                      </div>
                      <div className="item-fields">
                        <div className="item-field">
                          <label>Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                            min="1"
                            className="qty-input"
                          />
                        </div>
                        <div className="item-field">
                          <label>Discount (₹)</label>
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateOrderItem(index, 'discount', e.target.value)}
                            min="0"
                            step="0.01"
                            className="discount-input"
                          />
                        </div>
                      </div>
                      <div className="item-actions">
                        <div className="item-total">
                          ₹{calculateItemTotal(item).toFixed(2)}
                        </div>
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeProduct(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="add-item-card" onClick={openModal}>
                    <span className="add-item-icon">+</span>
                    <span className="add-item-text">Add Item</span>
                  </button>
                </div>

                {orderItems.length > 0 && (
                  <div className="order-total">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="form-section">
              <div className="section-header-bar">
                <h3>Delivery Information</h3>
              </div>
              <div className="section-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="deliveryDate">Delivery Date *</label>
                    <input
                      type="date"
                      id="deliveryDate"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="deliveryChannel">Delivery Channel *</label>
                    <select
                      id="deliveryChannel"
                      name="deliveryChannel"
                      value={formData.deliveryChannel}
                      onChange={handleChange}
                      required
                    >
                      <option value="Pickup">Pickup</option>
                      <option value="Courier">Courier</option>
                      <option value="Beat Delivery">Beat Delivery</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating Order...' : 'Create Order'}
            </button>
          </form>}
        </div>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Product</h3>
              <button type="button" className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Search Products</label>
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="form-group">
                <label>Select Product *</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="modal-select"
                >
                  <option value="">-- Select Product --</option>
                  {getFilteredProducts().map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.product_name} - ₹{parseFloat(product.partner_price).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Discount (₹)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button type="button" className="modal-btn-add" onClick={addProductItem}>
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateOrder;

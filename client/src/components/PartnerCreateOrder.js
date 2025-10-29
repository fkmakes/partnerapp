import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PartnerNavbar from './PartnerNavbar';
import './PartnerCreateOrder.css';

function PartnerCreateOrder() {
  const navigate = useNavigate();
  const [partnerId, setPartnerId] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState('Pickup');
  const [screen, setScreen] = useState('products'); // 'products', 'quantity', 'order'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get partner info from session storage
    const partner = JSON.parse(sessionStorage.getItem('partner') || '{}');
    if (partner.id) {
      setPartnerId(partner.id);
    } else {
      navigate('/');
    }

    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setQuantity('');
    setScreen('quantity');
  };

  const handleCalculatorInput = (value) => {
    if (value === 'clear') {
      setQuantity('');
    } else if (value === 'back') {
      setQuantity(quantity.slice(0, -1));
    } else {
      setQuantity(quantity + value);
    }
  };

  const handleAddToOrder = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    // Check if product already exists in order
    const existingItemIndex = orderItems.findIndex(
      item => item.product_id === selectedProduct.id
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const newItems = [...orderItems];
      newItems[existingItemIndex].quantity = parseInt(newItems[existingItemIndex].quantity) + parseInt(quantity);
      setOrderItems(newItems);
    } else {
      // Add new item
      const newItem = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.product_name,
        price: parseFloat(selectedProduct.partner_price),
        quantity: parseInt(quantity)
      };
      setOrderItems([...orderItems, newItem]);
    }

    setSelectedProduct(null);
    setQuantity('');
    setScreen('order');
  };

  const handleQuantityChange = (index, delta) => {
    const newItems = [...orderItems];
    const newQty = newItems[index].quantity + delta;

    if (newQty <= 0) {
      // Remove item if quantity becomes 0
      setOrderItems(orderItems.filter((_, i) => i !== index));
    } else {
      newItems[index].quantity = newQty;
      setOrderItems(newItems);
    }
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const handleProceedToDelivery = () => {
    if (orderItems.length === 0) {
      alert('Please add at least one item to proceed');
      return;
    }
    setShowDeliveryModal(true);
  };

  const handleSubmitOrder = async () => {
    if (!deliveryDate) {
      alert('Please select a delivery date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: partnerId,
          products: orderItems.map(item => ({
            productId: item.product_id,
            quantity: item.quantity,
            discount: 0 // Partners don't set discount
          })),
          deliveryDate: deliveryDate,
          deliveryChannel: deliveryChannel,
          createdBy: 'partner'
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Order created successfully!\nOrder ID: ${data.order.orderId}`);
        navigate('/partner/home');
      } else {
        setError(data.message || 'Failed to create order');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum delivery date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="partner-order-container">
      <PartnerNavbar />

      <div className="partner-order-content">
        {/* Header */}
        <div className="partner-order-header">
          <button className="back-btn-order" onClick={() => {
            if (screen === 'quantity') setScreen('products');
            else if (screen === 'order') setScreen('products');
            else navigate('/partner/home');
          }}>
            ←
          </button>
          <h1>Create Order</h1>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Products Screen */}
        {screen === 'products' && (
          <div className="products-screen">
            <div className="screen-title">Select Product</div>
            <div className="products-list">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="product-card-order"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="product-info-order">
                    <div className="product-name-order">{product.product_name}</div>
                    <div className="product-price-order">₹{parseFloat(product.partner_price).toFixed(2)}</div>
                  </div>
                  <div className="product-arrow">→</div>
                </div>
              ))}
            </div>

            {orderItems.length > 0 && (
              <div className="floating-order-summary">
                <div className="summary-info">
                  <span>{orderItems.length} item(s)</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                <button className="view-order-btn" onClick={() => setScreen('order')}>
                  View Order →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quantity Screen */}
        {screen === 'quantity' && selectedProduct && (
          <div className="quantity-screen">
            <div className="product-selected-info">
              <div className="selected-product-name">{selectedProduct.product_name}</div>
              <div className="selected-product-price">₹{parseFloat(selectedProduct.partner_price).toFixed(2)}</div>
            </div>

            <div className="quantity-input-section">
              <div className="quantity-display">
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  placeholder="0"
                  className="quantity-input-order"
                />
                <div className="quantity-label">Quantity</div>
              </div>

              <div className="calculator">
                <div className="calc-row">
                  <button className="calc-btn" onClick={() => handleCalculatorInput('1')}>1</button>
                  <button className="calc-btn" onClick={() => handleCalculatorInput('2')}>2</button>
                  <button className="calc-btn" onClick={() => handleCalculatorInput('3')}>3</button>
                </div>
                <div className="calc-row">
                  <button className="calc-btn" onClick={() => handleCalculatorInput('4')}>4</button>
                  <button className="calc-btn" onClick={() => handleCalculatorInput('5')}>5</button>
                  <button className="calc-btn" onClick={() => handleCalculatorInput('6')}>6</button>
                </div>
                <div className="calc-row">
                  <button className="calc-btn" onClick={() => handleCalculatorInput('7')}>7</button>
                  <button className="calc-btn" onClick={() => handleCalculatorInput('8')}>8</button>
                  <button className="calc-btn" onClick={() => handleCalculatorInput('9')}>9</button>
                </div>
                <div className="calc-row">
                  <button className="calc-btn calc-clear" onClick={() => handleCalculatorInput('clear')}>C</button>
                  <button className="calc-btn" onClick={() => handleCalculatorInput('0')}>0</button>
                  <button className="calc-btn calc-back" onClick={() => handleCalculatorInput('back')}>←</button>
                </div>
              </div>

              <button className="add-to-order-btn" onClick={handleAddToOrder}>
                Add to Order
              </button>
            </div>
          </div>
        )}

        {/* Order Screen */}
        {screen === 'order' && (
          <div className="order-screen">
            <div className="screen-title">Order Items</div>

            {orderItems.length === 0 ? (
              <div className="empty-order">
                <p>No items in order</p>
                <button className="add-items-btn" onClick={() => setScreen('products')}>
                  + Add Items
                </button>
              </div>
            ) : (
              <>
                <div className="order-items-list">
                  {orderItems.map((item, index) => (
                    <div key={index} className="order-item-card">
                      <div className="item-details">
                        <div className="item-name">{item.product_name}</div>
                        <div className="item-price">₹{item.price.toFixed(2)} × {item.quantity}</div>
                      </div>
                      <div className="item-controls">
                        <div className="qty-controls">
                          <button
                            className="qty-minus"
                            onClick={() => handleQuantityChange(index, -1)}
                          >
                            −
                          </button>
                          <span className="qty-display">{item.quantity}</span>
                          <button
                            className="qty-plus"
                            onClick={() => handleQuantityChange(index, 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="item-total">₹{(item.price * item.quantity).toFixed(2)}</div>
                        <button
                          className="remove-item-btn"
                          onClick={() => handleRemoveItem(index)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="add-more-items-inline-btn"
                  onClick={() => setScreen('products')}
                >
                  + Add More Items
                </button>

                <div className="order-total-section">
                  <div className="total-row">
                    <span>Total Items:</span>
                    <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="total-row total-amount-row">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button className="proceed-btn" onClick={handleProceedToDelivery}>
                  Proceed to Delivery Info
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="modal-overlay" onClick={() => setShowDeliveryModal(false)}>
          <div className="delivery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delivery-modal-header">
              <h2>Delivery Information</h2>
              <button className="modal-close" onClick={() => setShowDeliveryModal(false)}>
                ×
              </button>
            </div>

            <div className="delivery-modal-body">
              <div className="delivery-form-group">
                <label>Delivery Date *</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={getTomorrowDate()}
                  className="delivery-input"
                />
              </div>

              <div className="delivery-form-group">
                <label>Delivery Channel *</label>
                <select
                  value={deliveryChannel}
                  onChange={(e) => setDeliveryChannel(e.target.value)}
                  className="delivery-input"
                >
                  <option value="Pickup">Pickup</option>
                  <option value="Courier">Courier</option>
                  <option value="Beat Delivery">Beat Delivery</option>
                </select>
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Total Items:</span>
                  <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="delivery-modal-footer">
              <button
                className="cancel-delivery-btn"
                onClick={() => setShowDeliveryModal(false)}
              >
                Cancel
              </button>
              <button
                className="submit-order-btn"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartnerCreateOrder;

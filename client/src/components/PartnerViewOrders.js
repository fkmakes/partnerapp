import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PartnerNavbar from './PartnerNavbar';
import './PartnerViewOrders.css';

function PartnerViewOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const partner = JSON.parse(sessionStorage.getItem('partner') || '{}');

      if (!partner.id) {
        console.error('No partner ID found');
        return;
      }

      const response = await fetch(`/api/partners/${partner.id}/orders`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedOrder(data.order);
        setOrderItems(data.items);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch order details', err);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Order cancelled successfully');
        setShowModal(false);
        fetchOrders();
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      alert('An error occurred while cancelling the order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Created':
        return '#3b82f6'; // Blue
      case 'Processing':
        return '#f59e0b'; // Orange
      case 'Shipped':
        return '#10b981'; // Green
      case 'Delivered':
        return '#059669'; // Dark Green
      case 'Cancelled':
        return '#dc2626'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const currentOrders = orders.filter(o => o.status === 'Order Created' || o.status === 'Processing');
  const orderHistory = orders.filter(o => o.status !== 'Order Created' && o.status !== 'Processing');

  return (
    <div className="partner-orders-container">
      <PartnerNavbar />

      <div className="partner-orders-content">
        <div className="partner-orders-header">
          <button className="back-btn-orders" onClick={() => navigate('/partner/home')}>
            ←
          </button>
          <h1>My Orders</h1>
        </div>

        {loading ? (
          <div className="loading-orders">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <p>No orders found</p>
            <button className="create-order-btn" onClick={() => navigate('/partner/create-order')}>
              Create Order
            </button>
          </div>
        ) : (
          <>
            {/* Current Orders */}
            {currentOrders.length > 0 && (
              <div className="orders-section">
                <h2 className="section-title">Current Orders</h2>
                <div className="orders-list">
                  {currentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="order-card"
                      onClick={() => fetchOrderDetails(order.id)}
                    >
                      <div className="order-card-header">
                        <div className="order-id">{order.order_id}</div>
                        <div
                          className="order-status"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </div>
                      </div>
                      <div className="order-card-body">
                        <div className="order-info-row">
                          <span className="label">Amount:</span>
                          <span className="value">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="order-info-row">
                          <span className="label">Delivery Date:</span>
                          <span className="value">{new Date(order.delivery_date).toLocaleDateString()}</span>
                        </div>
                        <div className="order-info-row">
                          <span className="label">Channel:</span>
                          <span className="value">{order.delivery_channel}</span>
                        </div>
                      </div>
                      <div className="order-card-footer">
                        <span className="order-date">Ordered on {new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="view-details">View Details →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order History */}
            {orderHistory.length > 0 && (
              <div className="orders-section">
                <h2 className="section-title">Order History</h2>
                <div className="orders-list">
                  {orderHistory.map((order) => (
                    <div
                      key={order.id}
                      className="order-card"
                      onClick={() => fetchOrderDetails(order.id)}
                    >
                      <div className="order-card-header">
                        <div className="order-id">{order.order_id}</div>
                        <div
                          className="order-status"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </div>
                      </div>
                      <div className="order-card-body">
                        <div className="order-info-row">
                          <span className="label">Amount:</span>
                          <span className="value">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="order-info-row">
                          <span className="label">Delivery Date:</span>
                          <span className="value">{new Date(order.delivery_date).toLocaleDateString()}</span>
                        </div>
                        <div className="order-info-row">
                          <span className="label">Channel:</span>
                          <span className="value">{order.delivery_channel}</span>
                        </div>
                      </div>
                      <div className="order-card-footer">
                        <span className="order-date">Ordered on {new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="view-details">View Details →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Order Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="order-modal-body">
              <div className="order-detail-group">
                <div className="detail-row">
                  <span className="detail-label">Order ID:</span>
                  <span className="detail-value">{selectedOrder.order_id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery Date:</span>
                  <span className="detail-value">
                    {new Date(selectedOrder.delivery_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery Channel:</span>
                  <span className="detail-value">{selectedOrder.delivery_channel}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ordered On:</span>
                  <span className="detail-value">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="order-items-section">
                <h3>Items</h3>
                <div className="order-items-list">
                  {orderItems.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-name">{item.product_name}</div>
                      <div className="item-details">
                        <span>Qty: {item.quantity}</span>
                        <span>Price: ₹{parseFloat(item.price).toFixed(2)}</span>
                        {item.discount > 0 && <span>Discount: ₹{parseFloat(item.discount).toFixed(2)}</span>}
                        <span className="item-total">
                          Total: ₹{((parseFloat(item.price) - parseFloat(item.discount || 0)) * parseInt(item.quantity)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-total-section">
                <div className="total-row">
                  <span>Total Amount:</span>
                  <span className="total-amount">₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="order-modal-footer">
              {selectedOrder.status === 'Order Created' ? (
                <>
                  <button
                    className="cancel-order-btn"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                  >
                    Cancel Order
                  </button>
                  <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                </>
              ) : (
                <button className="close-modal-btn-full" onClick={() => setShowModal(false)}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartnerViewOrders;

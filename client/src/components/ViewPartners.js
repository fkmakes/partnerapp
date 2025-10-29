import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './ViewPartners.css';

function ViewPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerOrders, setPartnerOrders] = useState([]);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      const data = await response.json();

      if (data.success) {
        setPartners(data.partners);
      } else {
        setError(data.message || 'Failed to fetch partners');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrders = async (partner) => {
    setSelectedPartner(partner);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.success) {
        // Filter orders for this partner
        const filtered = data.orders.filter(order => order.partner_id === partner.id);
        setPartnerOrders(filtered);
        setShowOrdersModal(true);
      }
    } catch (err) {
      alert('Failed to load partner orders');
    }
  };

  const handleViewDetails = (partner) => {
    alert(`View Details for ${partner.partner_name} - This feature will be implemented later`);
  };

  const closeOrdersModal = () => {
    setShowOrdersModal(false);
    setSelectedPartner(null);
    setPartnerOrders([]);
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrderDetails(data.order);
        setOrderItems(data.items);
        setSelectedOrderId(orderId);
        setShowOrderDetailsModal(true);
      }
    } catch (err) {
      alert('Failed to load order details');
    }
  };

  const closeOrderDetailsModal = () => {
    setShowOrderDetailsModal(false);
    setSelectedOrderId(null);
    setOrderDetails(null);
    setOrderItems([]);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${selectedOrderId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Order cancelled successfully');
        closeOrderDetailsModal();
        // Refresh partner orders if the modal is still open
        if (selectedPartner) {
          handleViewOrders(selectedPartner);
        }
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      alert('An error occurred while cancelling the order');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/orders/${selectedOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        alert('Order status updated successfully');
        setOrderDetails({ ...orderDetails, status: newStatus });
        // Refresh partner orders
        if (selectedPartner) {
          handleViewOrders(selectedPartner);
        }
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('An error occurred while updating status');
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Created':
        return '#3b82f6';
      case 'Processing':
        return '#f59e0b';
      case 'Shipped':
        return '#8b5cf6';
      case 'Delivered':
        return '#10b981';
      case 'Cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="admin-container">
      <Navbar />
      <div className="admin-content">
        <div className="partners-header">
          <h1>All Partners</h1>
          <p>View and manage all registered partners</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading partners...</div>
        ) : (
          <div className="partners-table-container">
            {partners.length === 0 ? (
              <div className="no-partners">
                <p>No partners found. Create your first partner!</p>
              </div>
            ) : (
              <table className="partners-table">
                <thead>
                  <tr>
                    <th>Partner ID</th>
                    <th>User ID</th>
                    <th>Partner Name</th>
                    <th>Mobile Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id}>
                      <td className="partner-id">{partner.id}</td>
                      <td><span className="userid-badge">{partner.userid}</span></td>
                      <td className="partner-name">{partner.partner_name || '-'}</td>
                      <td className="phone-number">{partner.phone || '-'}</td>
                      <td className="action-buttons">
                        <button
                          className="view-orders-btn"
                          onClick={() => handleViewOrders(partner)}
                        >
                          View Orders
                        </button>
                        <button
                          className="view-details-btn"
                          onClick={() => handleViewDetails(partner)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Partner Orders Modal */}
      {showOrdersModal && selectedPartner && (
        <div className="partner-orders-modal-overlay" onClick={closeOrdersModal}>
          <div className="partner-orders-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="partner-orders-modal-header">
              <h2>Order History - {selectedPartner.partner_name}</h2>
              <button className="modal-close-btn" onClick={closeOrdersModal}>×</button>
            </div>

            <div className="partner-orders-modal-body">
              {partnerOrders.length === 0 ? (
                <div className="no-orders-message">
                  <p>No orders found for this partner</p>
                </div>
              ) : (
                <table className="partner-orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Total Amount</th>
                      <th>Delivery Date</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="order-row-clickable"
                        onClick={() => viewOrderDetails(order.id)}
                      >
                        <td className="order-id-link">{order.order_id}</td>
                        <td>
                          <span
                            className="status-badge-small"
                            style={{
                              backgroundColor:
                                order.status === 'Order Created'
                                  ? '#3b82f6'
                                  : order.status === 'Processing'
                                  ? '#f59e0b'
                                  : order.status === 'Shipped'
                                  ? '#8b5cf6'
                                  : order.status === 'Delivered'
                                  ? '#10b981'
                                  : '#ef4444',
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="amount-text">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                        <td>{new Date(order.delivery_date).toLocaleDateString()}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="partner-orders-modal-footer">
              <button className="close-modal-btn" onClick={closeOrdersModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal (from ViewOrders) */}
      {showOrderDetailsModal && orderDetails && (
        <div className="order-modal-overlay" onClick={closeOrderDetailsModal}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Order Details</h2>
              <button className="modal-close-btn" onClick={closeOrderDetailsModal}>×</button>
            </div>

            <div className="order-modal-body">
              {/* Order Info */}
              <div className="order-info-section">
                <div className="order-info-row">
                  <div className="order-info-item">
                    <label>Order ID:</label>
                    <span className="order-id-large">{orderDetails.order_id}</span>
                  </div>
                  <div className="order-info-item">
                    <label>Status:</label>
                    <span
                      className="status-badge-large"
                      style={{ backgroundColor: getStatusColor(orderDetails.status) }}
                    >
                      {orderDetails.status}
                    </span>
                  </div>
                </div>

                <div className="order-info-row">
                  <div className="order-info-item">
                    <label>Partner:</label>
                    <span>{orderDetails.partner_name}</span>
                  </div>
                  <div className="order-info-item">
                    <label>Partner ID:</label>
                    <span>{orderDetails.partner_userid}</span>
                  </div>
                </div>

                <div className="order-info-row">
                  <div className="order-info-item">
                    <label>Delivery Date:</label>
                    <span>{new Date(orderDetails.delivery_date).toLocaleDateString()}</span>
                  </div>
                  <div className="order-info-item">
                    <label>Delivery Channel:</label>
                    <span>{orderDetails.delivery_channel}</span>
                  </div>
                </div>

                <div className="order-info-row">
                  <div className="order-info-item">
                    <label>Created By:</label>
                    <span>{orderDetails.created_by}</span>
                  </div>
                  <div className="order-info-item">
                    <label>Created At:</label>
                    <span>{new Date(orderDetails.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="order-items-section">
                <h3>Order Items</h3>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product_name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{parseFloat(item.price).toFixed(2)}</td>
                        <td>₹{parseFloat(item.discount).toFixed(2)}</td>
                        <td>₹{((parseFloat(item.price) - parseFloat(item.discount)) * parseInt(item.quantity)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="total-label">Total Amount:</td>
                      <td className="total-amount">₹{parseFloat(orderDetails.total_amount).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Actions */}
              <div className="order-actions-section">
                <div className="status-change-section">
                  <label>Change Status:</label>
                  <select
                    value={orderDetails.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={orderDetails.status === 'Cancelled'}
                  >
                    <option value="Order Created">Order Created</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div className="action-buttons">
                  <button className="print-btn" onClick={handlePrintOrder}>
                    Print Order
                  </button>
                  {orderDetails.status !== 'Cancelled' && orderDetails.status !== 'Delivered' && (
                    <button className="cancel-btn" onClick={handleCancelOrder}>
                      Cancel Order
                    </button>
                  )}
                  <button className="close-btn" onClick={closeOrderDetailsModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewPartners;

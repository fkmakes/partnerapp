import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './ViewOrders.css';

function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrderDetails(data.order);
        setOrderItems(data.items);
        setSelectedOrder(orderId);
        setShowModal(true);
      }
    } catch (err) {
      alert('Failed to load order details');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedOrder(null);
    setOrderDetails(null);
    setOrderItems([]);
    setEditedItems([]);
  };

  const handleEditMode = () => {
    // Create a copy of items for editing
    setEditedItems(orderItems.map(item => ({
      ...item,
      quantity: item.quantity,
      discount: item.discount
    })));
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedItems([]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...editedItems];
    newItems[index][field] = value;
    setEditedItems(newItems);
  };

  const handleSaveOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${selectedOrder}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: editedItems.map(item => ({
            product_id: item.product_id,
            quantity: parseInt(item.quantity),
            discount: parseFloat(item.discount || 0),
            price: parseFloat(item.price)
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Order updated successfully');
        // Refresh order details
        viewOrderDetails(selectedOrder);
        setEditMode(false);
        fetchOrders(); // Refresh orders list
      } else {
        alert(data.message || 'Failed to update order');
      }
    } catch (err) {
      alert('An error occurred while updating the order');
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${selectedOrder}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Order cancelled successfully');
        closeModal();
        fetchOrders();
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      alert('An error occurred while cancelling the order');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/orders/${selectedOrder}/status`, {
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
        fetchOrders();
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
        <div className="orders-header">
          <h1>Orders</h1>
          <p className="subtitle">View all orders and their status</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found. Create your first order to get started!</p>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Partner</th>
                  <th>Partner ID</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Delivery Date</th>
                  <th>Channel</th>
                  <th>Total Amount</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">{order.order_id}</td>
                    <td>{order.partner_name || 'N/A'}</td>
                    <td>{order.partner_userid || 'N/A'}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="created-by">{order.created_by}</td>
                    <td>{new Date(order.delivery_date).toLocaleDateString()}</td>
                    <td>
                      <span className="channel-badge">
                        {order.delivery_channel}
                      </span>
                    </td>
                    <td className="amount">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>
                      <button
                        className="view-order-btn"
                        onClick={() => viewOrderDetails(order.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && orderDetails && (
        <div className="order-modal-overlay" onClick={closeModal}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Order Details</h2>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
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
                <div className="order-items-header">
                  <h3>Order Items</h3>
                  {!editMode && (orderDetails.status === 'Order Created' || orderDetails.status === 'Processing') && (
                    <button className="edit-order-btn" onClick={handleEditMode}>
                      Edit Order
                    </button>
                  )}
                </div>
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
                    {editMode ? (
                      editedItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product_name}</td>
                          <td>
                            <input
                              type="number"
                              className="qty-edit-input"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              min="1"
                            />
                          </td>
                          <td>₹{parseFloat(item.price).toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              className="discount-edit-input"
                              value={item.discount}
                              onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>₹{((parseFloat(item.price) - parseFloat(item.discount || 0)) * parseInt(item.quantity || 0)).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      orderItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>₹{parseFloat(item.price).toFixed(2)}</td>
                          <td>₹{parseFloat(item.discount).toFixed(2)}</td>
                          <td>₹{((parseFloat(item.price) - parseFloat(item.discount)) * parseInt(item.quantity)).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="total-label">Total Amount:</td>
                      <td className="total-amount">
                        ₹{editMode
                          ? editedItems.reduce((sum, item) => sum + ((parseFloat(item.price) - parseFloat(item.discount || 0)) * parseInt(item.quantity || 0)), 0).toFixed(2)
                          : parseFloat(orderDetails.total_amount).toFixed(2)
                        }
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Actions */}
              <div className="order-actions-section">
                {editMode ? (
                  <div className="edit-action-buttons">
                    <button className="save-order-btn" onClick={handleSaveOrder}>
                      Save Changes
                    </button>
                    <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                      Cancel Edit
                    </button>
                  </div>
                ) : (
                  <>
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
                      <button className="close-btn" onClick={closeModal}>
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewOrders;

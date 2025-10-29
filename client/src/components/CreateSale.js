import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PartnerNavbar from './PartnerNavbar';
import './CreateSale.css';

function CreateSale() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('items'); // items, quantity, bill
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [billItems, setBillItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchPartnerInventory();
  }, []);

  const fetchPartnerInventory = async () => {
    try {
      const partner = JSON.parse(sessionStorage.getItem('partner') || '{}');

      if (!partner.id) {
        console.error('No partner ID found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/partners/${partner.id}/inventory`);
      const data = await response.json();

      if (data.success) {
        // Map inventory to product format expected by UI
        const inventoryProducts = data.inventory.map(inv => ({
          id: inv.product_id,
          product_name: inv.product_name,
          mrp: inv.mrp,
          partner_price: inv.partner_price,
          current_stock: inv.stock // Partner's stock
        }));
        setProducts(inventoryProducts);
      }
    } catch (err) {
      console.error('Failed to fetch partner inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setQuantity('');
    setCurrentView('quantity');
  };

  const handleCalculatorInput = (value) => {
    if (value === 'clear') {
      setQuantity('');
    } else if (value === 'backspace') {
      setQuantity(prev => prev.slice(0, -1));
    } else {
      // Limit to available stock
      const newQty = quantity + value;
      if (parseInt(newQty) <= selectedProduct.current_stock) {
        setQuantity(newQty);
      }
    }
  };

  const handleAddToBill = () => {
    if (!quantity || parseInt(quantity) === 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const newItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.product_name,
      price: selectedProduct.mrp,
      quantity: parseInt(quantity),
      total: parseFloat(selectedProduct.mrp) * parseInt(quantity)
    };

    // Check if product already in bill
    const existingIndex = billItems.findIndex(item => item.product_id === selectedProduct.id);

    if (existingIndex >= 0) {
      // Update quantity
      const updatedItems = [...billItems];
      updatedItems[existingIndex].quantity += parseInt(quantity);
      updatedItems[existingIndex].total = updatedItems[existingIndex].quantity * updatedItems[existingIndex].price;
      setBillItems(updatedItems);
    } else {
      setBillItems([...billItems, newItem]);
    }

    setCurrentView('bill');
    setSelectedProduct(null);
    setQuantity('');
  };

  const handleAddMoreItems = () => {
    setCurrentView('items');
  };

  const handleRemoveItem = (index) => {
    const updatedItems = billItems.filter((_, i) => i !== index);
    setBillItems(updatedItems);
  };

  const handleQuantityChange = (index, change) => {
    const updatedItems = [...billItems];
    const newQuantity = updatedItems[index].quantity + change;

    if (newQuantity <= 0) {
      // Remove item if quantity becomes 0
      handleRemoveItem(index);
      return;
    }

    // Get product to check max stock
    const product = products.find(p => p.id === updatedItems[index].product_id);
    if (product && newQuantity > product.current_stock) {
      alert(`Only ${product.current_stock} units available in stock`);
      return;
    }

    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price;
    setBillItems(updatedItems);
  };

  const handleOpenCustomerModal = () => {
    if (billItems.length === 0) {
      alert('No items in bill');
      return;
    }
    setShowCustomerModal(true);
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
    setCustomerDetails({ name: '', phone: '', address: '' });
  };

  const handleGenerateBill = async () => {
    if (!customerDetails.name || !customerDetails.phone) {
      alert('Please enter customer name and mobile number');
      return;
    }

    if (customerDetails.phone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const partner = JSON.parse(sessionStorage.getItem('partner') || '{}');

      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partnerId: partner.id,
          items: billItems,
          customerName: customerDetails.name,
          customerPhone: customerDetails.phone,
          customerAddress: customerDetails.address
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Sale completed successfully!');
        setBillItems([]);
        setCustomerDetails({ name: '', phone: '', address: '' });
        setShowCustomerModal(false);
        setCurrentView('items');
        fetchPartnerInventory(); // Refresh partner stock
      } else {
        alert(data.message || 'Failed to complete sale');
      }
    } catch (err) {
      alert('An error occurred while processing the sale');
    }
  };

  const calculateTotal = () => {
    return billItems.reduce((sum, item) => sum + item.total, 0).toFixed(2);
  };

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pos-container">
      <PartnerNavbar />

      {/* Item List View */}
      {currentView === 'items' && (
        <div className="pos-content">
          <div className="pos-header">
            <button className="back-btn" onClick={() => navigate('/partner/home')}>
              ← Back
            </button>
            <h1>Select Item</h1>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : (
            <div className="product-list">
              {filteredProducts.length === 0 ? (
                <div className="empty-state">No products in stock</div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="product-item"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="product-info">
                      <div className="product-name">{product.product_name}</div>
                      <div className="product-meta">
                        <span className="product-price">₹{parseFloat(product.mrp).toFixed(2)}</span>
                        <span className="product-stock">{product.current_stock} in stock</span>
                      </div>
                    </div>
                    <div className="product-arrow">→</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Quantity Selector View */}
      {currentView === 'quantity' && selectedProduct && (
        <div className="pos-content">
          <div className="pos-header">
            <button className="back-btn" onClick={() => setCurrentView('items')}>
              ← Back
            </button>
            <h1>Enter Quantity</h1>
          </div>

          <div className="quantity-section">
            <div className="selected-product-info">
              <h2>{selectedProduct.product_name}</h2>
              <p className="price-display">₹{parseFloat(selectedProduct.mrp).toFixed(2)}</p>
              <p className="stock-display">Available: {selectedProduct.current_stock} units</p>
            </div>

            <div className="quantity-display">
              <div className="quantity-value">{quantity || '0'}</div>
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
                <button className="calc-btn calc-backspace" onClick={() => handleCalculatorInput('backspace')}>⌫</button>
              </div>
            </div>

            <button className="add-to-bill-btn" onClick={handleAddToBill} disabled={!quantity}>
              Add to Bill
            </button>
          </div>
        </div>
      )}

      {/* Bill View */}
      {currentView === 'bill' && (
        <div className="pos-content">
          <div className="pos-header">
            <button className="back-btn" onClick={() => navigate('/partner/home')}>
              ← Home
            </button>
            <h1>Bill</h1>
          </div>

          <div className="bill-section">
            {billItems.length === 0 ? (
              <div className="empty-bill">
                <p>No items in bill</p>
                <button className="add-items-btn" onClick={handleAddMoreItems}>
                  Add Items
                </button>
              </div>
            ) : (
              <>
                <div className="bill-items">
                  {billItems.map((item, index) => (
                    <div key={index} className="bill-item">
                      <div className="bill-item-info">
                        <div className="bill-item-name">{item.product_name}</div>
                        <div className="bill-item-details">
                          ₹{parseFloat(item.price).toFixed(2)} each
                        </div>
                      </div>
                      <div className="bill-item-right">
                        <div className="quantity-adjuster">
                          <button
                            className="qty-btn qty-minus"
                            onClick={() => handleQuantityChange(index, -1)}
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn qty-plus"
                            onClick={() => handleQuantityChange(index, 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="bill-item-total">₹{item.total.toFixed(2)}</div>
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

                <button className="add-more-items-inline-btn" onClick={handleAddMoreItems}>
                  + Add More Items
                </button>

                <div className="bill-total">
                  <span className="total-label">Total Amount</span>
                  <span className="total-amount">₹{calculateTotal()}</span>
                </div>

                <div className="bill-actions">
                  <button className="generate-bill-btn" onClick={handleOpenCustomerModal}>
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && (
        <div className="customer-modal-overlay" onClick={handleCloseCustomerModal}>
          <div className="customer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="customer-modal-header">
              <h2>Customer Details</h2>
              <button className="modal-close-btn" onClick={handleCloseCustomerModal}>×</button>
            </div>

            <div className="customer-modal-body">
              <div className="customer-form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  className="customer-input"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="customer-form-group">
                <label>Mobile Number *</label>
                <div className="phone-input-group">
                  <span className="country-code">+91</span>
                  <input
                    type="tel"
                    className="customer-input phone-input"
                    value={customerDetails.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setCustomerDetails({ ...customerDetails, phone: value });
                      }
                    }}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="customer-form-group">
                <label>Address (Optional)</label>
                <textarea
                  className="customer-input customer-textarea"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                  placeholder="Enter address"
                  rows="3"
                />
              </div>

              <div className="bill-summary">
                <div className="summary-row">
                  <span>Total Items:</span>
                  <span>{billItems.length}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
            </div>

            <div className="customer-modal-footer">
              <button className="cancel-customer-btn" onClick={handleCloseCustomerModal}>
                Cancel
              </button>
              <button className="confirm-sale-btn" onClick={handleGenerateBill}>
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateSale;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const pool = require('./db/config');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Helper function to generate random password
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper function to generate userid from partner name
function generateUserid(partnerName) {
  const cleanName = partnerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomNum = Math.floor(Math.random() * 1000);
  return `${cleanName}${randomNum}`;
}

// Helper function to generate order ID
function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
}

// Login endpoint with PostgreSQL
app.post('/api/login', async (req, res) => {
  const { userid, password } = req.body;

  // Validate input
  if (!userid || !password) {
    return res.status(400).json({
      success: false,
      message: 'User ID and password are required'
    });
  }

  try {
    // Query database for partner
    const result = await pool.query(
      'SELECT * FROM partners WHERE userid = $1',
      [userid]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const partner = result.rows[0];

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, partner.password);

    if (isPasswordValid) {
      return res.json({
        success: true,
        message: 'Login successful',
        partnerType: partner.partner_type,
        userid: partner.userid,
        id: partner.id,
        partner_name: partner.partner_name,
        email: partner.email,
        phone: partner.phone
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add new partner endpoint (admin only)
app.post('/api/partners', async (req, res) => {
  const { partnerName, email, phone, address } = req.body;

  // Validate input
  if (!partnerName) {
    return res.status(400).json({
      success: false,
      message: 'Partner name is required'
    });
  }

  try {
    // Generate credentials
    const userid = generateUserid(partnerName);
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new partner
    const result = await pool.query(
      'INSERT INTO partners (userid, password, partner_type, partner_name, email, phone, address, plain_password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userid, hashedPassword, 'partner', partnerName, email, phone, address, password]
    );

    const newPartner = result.rows[0];

    return res.json({
      success: true,
      message: 'Partner created successfully',
      partner: {
        id: newPartner.id,
        userid: newPartner.userid,
        password: password, // Return plain password only for display
        partnerName: newPartner.partner_name,
        email: newPartner.email,
        phone: newPartner.phone,
        address: newPartner.address
      }
    });
  } catch (err) {
    console.error('Create partner error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all partners (admin only)
app.get('/api/partners', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, userid, partner_name, email, phone, address, plain_password, created_at FROM partners WHERE partner_type = $1 ORDER BY created_at DESC',
      ['partner']
    );

    return res.json({
      success: true,
      partners: result.rows
    });
  } catch (err) {
    console.error('Get partners error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add new product endpoint (admin only)
app.post('/api/products', async (req, res) => {
  const { productName, partnerPrice, mrp, initialStock } = req.body;

  // Validate input
  if (!productName || !partnerPrice || !mrp || initialStock === undefined) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    // Insert new product
    const result = await pool.query(
      'INSERT INTO products (product_name, partner_price, mrp, current_stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [productName, partnerPrice, mrp, initialStock]
    );

    const newProduct = result.rows[0];

    return res.json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: newProduct.id,
        productName: newProduct.product_name,
        partnerPrice: newProduct.partner_price,
        mrp: newProduct.mrp,
        currentStock: newProduct.current_stock
      }
    });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all products (admin only)
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );

    return res.json({
      success: true,
      products: result.rows
    });
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update product (admin only)
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { partnerPrice, mrp, currentStock } = req.body;

  // Validate input
  if (partnerPrice === undefined || mrp === undefined || currentStock === undefined) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    // Update product
    const result = await pool.query(
      'UPDATE products SET partner_price = $1, mrp = $2, current_stock = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [partnerPrice, mrp, currentStock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.json({
      success: true,
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new order endpoint (admin only)
app.post('/api/orders', async (req, res) => {
  const { partnerId, products, deliveryDate, deliveryChannel, createdBy = 'admin' } = req.body;

  // Validate input
  if (!partnerId || !products || products.length === 0 || !deliveryDate || !deliveryChannel) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Generate order ID
    const orderId = generateOrderId();

    // Calculate total amount
    let totalAmount = 0;
    for (const item of products) {
      const productResult = await client.query('SELECT partner_price FROM products WHERE id = $1', [item.productId]);
      if (productResult.rows.length > 0) {
        const price = parseFloat(productResult.rows[0].partner_price);
        const discount = parseFloat(item.discount || 0);
        const quantity = parseInt(item.quantity);
        totalAmount += (price - discount) * quantity;
      }
    }

    // Insert order
    const orderResult = await client.query(
      'INSERT INTO orders (order_id, partner_id, status, created_by, delivery_date, delivery_channel, total_amount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [orderId, partnerId, 'Order Created', createdBy, deliveryDate, deliveryChannel, totalAmount]
    );

    const newOrder = orderResult.rows[0];

    // Insert order items and update product pending counts
    for (const item of products) {
      const productResult = await client.query('SELECT partner_price FROM products WHERE id = $1', [item.productId]);
      if (productResult.rows.length > 0) {
        const price = parseFloat(productResult.rows[0].partner_price);
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, discount, price) VALUES ($1, $2, $3, $4, $5)',
          [newOrder.id, item.productId, item.quantity, item.discount || 0, price]
        );

        // Update product pending_orders and pending_units
        await client.query(
          'UPDATE products SET pending_orders = pending_orders + 1, pending_units = pending_units + $1 WHERE id = $2',
          [parseInt(item.quantity), item.productId]
        );
      }
    }

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: newOrder.id,
        orderId: newOrder.order_id,
        partnerId: newOrder.partner_id,
        status: newOrder.status,
        createdBy: newOrder.created_by,
        deliveryDate: newOrder.delivery_date,
        deliveryChannel: newOrder.delivery_channel,
        totalAmount: newOrder.total_amount
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.*,
        p.partner_name,
        p.userid as partner_userid
      FROM orders o
      LEFT JOIN partners p ON o.partner_id = p.id
      ORDER BY o.created_at DESC
    `);

    return res.json({
      success: true,
      orders: result.rows
    });
  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single order with items
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const orderResult = await pool.query(`
      SELECT
        o.*,
        p.partner_name,
        p.userid as partner_userid,
        p.email as partner_email,
        p.phone as partner_phone,
        p.address as partner_address
      FROM orders o
      LEFT JOIN partners p ON o.partner_id = p.id
      WHERE o.id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items
    const itemsResult = await pool.query(`
      SELECT
        oi.*,
        pr.product_name,
        pr.partner_price as current_partner_price
      FROM order_items oi
      LEFT JOIN products pr ON oi.product_id = pr.id
      WHERE oi.order_id = $1
    `, [id]);

    return res.json({
      success: true,
      order: orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (err) {
    console.error('Get order error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Cancel order
app.delete('/api/orders/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Get order items before cancelling
    const itemsResult = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [id]
    );

    // Update products - decrease pending orders and units
    for (const item of itemsResult.rows) {
      await client.query(
        'UPDATE products SET pending_orders = pending_orders - 1, pending_units = pending_units - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Update order status to Cancelled
    await client.query(
      'UPDATE orders SET status = $1, status_changed_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['Cancelled', id]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Cancel order error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
});

// Update order items (edit order)
app.put('/api/orders/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { items } = req.body;

    // Get current order status
    const orderResult = await client.query('SELECT status FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderStatus = orderResult.rows[0].status;

    // Only allow editing for Order Created and Processing statuses
    if (orderStatus !== 'Order Created' && orderStatus !== 'Processing') {
      return res.status(400).json({
        success: false,
        message: 'Orders can only be edited when in "Order Created" or "Processing" status'
      });
    }

    // Get existing order items to calculate differences
    const existingItemsResult = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [id]
    );

    const existingItems = existingItemsResult.rows;

    // Update each order item
    let totalAmount = 0;
    for (const item of items) {
      // Find existing item to calculate quantity difference
      const existingItem = existingItems.find(ei => ei.product_id === item.product_id);
      const quantityDiff = parseInt(item.quantity) - (existingItem ? parseInt(existingItem.quantity) : 0);

      // Update order item
      await client.query(
        'UPDATE order_items SET quantity = $1, discount = $2 WHERE order_id = $3 AND product_id = $4',
        [item.quantity, item.discount, id, item.product_id]
      );

      // Update product pending units if quantity changed (only for non-shipped orders)
      if (quantityDiff !== 0 && orderStatus !== 'Shipped') {
        await client.query(
          'UPDATE products SET pending_units = pending_units + $1 WHERE id = $2',
          [quantityDiff, item.product_id]
        );
      }

      // Calculate total
      const price = parseFloat(item.price);
      const discount = parseFloat(item.discount || 0);
      const quantity = parseInt(item.quantity);
      totalAmount += (price - discount) * quantity;
    }

    // Update order total
    await client.query(
      'UPDATE orders SET total_amount = $1 WHERE id = $2',
      [totalAmount, id]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Order updated successfully',
      totalAmount: totalAmount
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update order error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status } = req.body;

    // Get current order status and partner_id
    const orderResult = await client.query('SELECT status, partner_id FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = orderResult.rows[0].status;
    const partnerId = orderResult.rows[0].partner_id;

    // If changing to Shipped or Delivered from Order Created/Processing
    if ((status === 'Shipped' || status === 'Delivered') && (oldStatus === 'Order Created' || oldStatus === 'Processing')) {
      // Get order items
      const itemsResult = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [id]
      );

      // Update products and partner inventory
      for (const item of itemsResult.rows) {
        // Decrease company stock, decrease pending, increase in_circulation
        await client.query(
          'UPDATE products SET current_stock = current_stock - $1, pending_orders = pending_orders - 1, pending_units = pending_units - $1, in_circulation = in_circulation + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );

        // Add to partner inventory (insert or update)
        await client.query(
          'INSERT INTO partner_inventory (partner_id, product_id, stock) VALUES ($1, $2, $3) ON CONFLICT (partner_id, product_id) DO UPDATE SET stock = partner_inventory.stock + $3, updated_at = CURRENT_TIMESTAMP',
          [partnerId, item.product_id, item.quantity]
        );
      }
    }

    // Update order status
    await client.query(
      'UPDATE orders SET status = $1, status_changed_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update order status error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
});

// Helper function to generate sale ID
function generateSaleId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `SALE-${timestamp}-${randomStr}`.toUpperCase();
}

// Create POS sale endpoint (partner only)
app.post('/api/sales', async (req, res) => {
  const { partnerId, items, customerName, customerPhone, customerAddress } = req.body;

  // Validate input
  if (!partnerId || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Partner ID and items are required'
    });
  }

  if (!customerName || !customerPhone) {
    return res.status(400).json({
      success: false,
      message: 'Customer name and phone are required'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Generate sale ID
    const saleId = generateSaleId();

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += parseFloat(item.total);
    }

    // Insert sale with customer details
    const saleResult = await client.query(
      'INSERT INTO sales (sale_id, partner_id, total_amount, customer_name, customer_phone, customer_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [saleId, partnerId, totalAmount, customerName, customerPhone, customerAddress || null]
    );

    const newSale = saleResult.rows[0];

    // Insert sale items and update partner inventory
    for (const item of items) {
      // Insert sale item
      await client.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, price, total) VALUES ($1, $2, $3, $4, $5)',
        [newSale.id, item.product_id, item.quantity, item.price, item.total]
      );

      // Decrease partner_inventory and in_circulation
      await client.query(
        'UPDATE partner_inventory SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE partner_id = $2 AND product_id = $3',
        [parseInt(item.quantity), partnerId, item.product_id]
      );

      // Decrease in_circulation
      await client.query(
        'UPDATE products SET in_circulation = in_circulation - $1 WHERE id = $2',
        [parseInt(item.quantity), item.product_id]
      );
    }

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Sale completed successfully',
      sale: {
        id: newSale.id,
        saleId: newSale.sale_id,
        partnerId: newSale.partner_id,
        totalAmount: newSale.total_amount,
        createdAt: newSale.created_at
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create sale error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message
    });
  } finally {
    client.release();
  }
});

// Get partner inventory
app.get('/api/partners/:partnerId/inventory', async (req, res) => {
  try {
    const { partnerId } = req.params;

    const result = await pool.query(`
      SELECT
        pi.*,
        p.product_name,
        p.partner_price,
        p.mrp
      FROM partner_inventory pi
      LEFT JOIN products p ON pi.product_id = p.id
      WHERE pi.partner_id = $1 AND pi.stock > 0
      ORDER BY p.product_name ASC
    `, [partnerId]);

    return res.json({
      success: true,
      inventory: result.rows
    });
  } catch (err) {
    console.error('Get partner inventory error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get partner orders
app.get('/api/partners/:partnerId/orders', async (req, res) => {
  try {
    const { partnerId } = req.params;

    const result = await pool.query(`
      SELECT
        o.*,
        p.partner_name,
        p.userid as partner_userid
      FROM orders o
      LEFT JOIN partners p ON o.partner_id = p.id
      WHERE o.partner_id = $1
      ORDER BY o.created_at DESC
    `, [partnerId]);

    return res.json({
      success: true,
      orders: result.rows
    });
  } catch (err) {
    console.error('Get partner orders error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Analytics endpoint for admin
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = '';
    let dateParams = [];
    if (startDate && endDate) {
      dateFilter = 'WHERE s.created_at BETWEEN $1 AND $2';
      dateParams = [startDate, endDate];
    }

    // Total Revenue
    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue,
             COUNT(*) as total_sales,
             COALESCE(SUM(
               (SELECT SUM(quantity) FROM sale_items WHERE sale_id = s.id)
             ), 0) as total_units
      FROM sales s
      ${dateFilter}
    `, dateParams);

    // Revenue by Partner
    const partnerRevenueResult = await pool.query(`
      SELECT
        p.id,
        p.partner_name,
        COALESCE(SUM(s.total_amount), 0) as revenue,
        COUNT(s.id) as sales_count,
        COALESCE(SUM(
          (SELECT SUM(quantity) FROM sale_items WHERE sale_id = s.id)
        ), 0) as units_sold
      FROM partners p
      LEFT JOIN sales s ON p.id = s.partner_id ${startDate && endDate ? 'AND s.created_at BETWEEN $1 AND $2' : ''}
      WHERE p.partner_type = 'partner'
      GROUP BY p.id, p.partner_name
      ORDER BY revenue DESC
    `, dateParams);

    // Top Products
    const topProductsResult = await pool.query(`
      SELECT
        pr.id,
        pr.product_name,
        COALESCE(SUM(si.total), 0) as revenue,
        COALESCE(SUM(si.quantity), 0) as units_sold,
        COUNT(DISTINCT si.sale_id) as sales_count
      FROM products pr
      LEFT JOIN sale_items si ON pr.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id ${startDate && endDate ? 'AND s.created_at BETWEEN $1 AND $2' : ''}
      GROUP BY pr.id, pr.product_name
      ORDER BY revenue DESC
      LIMIT 10
    `, dateParams);

    // Sales by Day of Week
    const salesByDayResult = await pool.query(`
      SELECT
        EXTRACT(DOW FROM created_at) as day_of_week,
        COUNT(*) as sales_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM sales s
      ${dateFilter}
      GROUP BY day_of_week
      ORDER BY day_of_week
    `, dateParams);

    // Sales Trend (last 30 days)
    const salesTrendResult = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as sales_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM sales
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Active Partners (made at least 1 sale)
    const activePartnersResult = await pool.query(`
      SELECT COUNT(DISTINCT partner_id) as active_partners
      FROM sales s
      ${dateFilter}
    `, dateParams);

    // Average Order Value
    const avgOrderValue = revenueResult.rows[0].total_sales > 0
      ? parseFloat(revenueResult.rows[0].total_revenue) / revenueResult.rows[0].total_sales
      : 0;

    return res.json({
      success: true,
      overview: {
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue || 0),
        totalSales: parseInt(revenueResult.rows[0].total_sales || 0),
        totalUnits: parseInt(revenueResult.rows[0].total_units || 0),
        activePartners: parseInt(activePartnersResult.rows[0].active_partners || 0),
        averageOrderValue: avgOrderValue
      },
      partnerPerformance: partnerRevenueResult.rows.map(p => ({
        partnerId: p.id,
        partnerName: p.partner_name,
        revenue: parseFloat(p.revenue || 0),
        salesCount: parseInt(p.sales_count || 0),
        unitsSold: parseInt(p.units_sold || 0)
      })),
      topProducts: topProductsResult.rows.map(p => ({
        productId: p.id,
        productName: p.product_name,
        revenue: parseFloat(p.revenue || 0),
        unitsSold: parseInt(p.units_sold || 0),
        salesCount: parseInt(p.sales_count || 0)
      })),
      salesByDay: salesByDayResult.rows.map(d => ({
        dayOfWeek: parseInt(d.day_of_week),
        salesCount: parseInt(d.sales_count),
        revenue: parseFloat(d.revenue || 0)
      })),
      salesTrend: salesTrendResult.rows.map(t => ({
        date: t.date,
        salesCount: parseInt(t.sales_count),
        revenue: parseFloat(t.revenue || 0)
      }))
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Partner detailed analytics
app.get('/api/analytics/partner/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let dateParams = [partnerId];
    if (startDate && endDate) {
      dateFilter = 'AND s.created_at BETWEEN $2 AND $3';
      dateParams = [partnerId, startDate, endDate];
    }

    // Partner Overview
    const partnerResult = await pool.query(`
      SELECT
        p.partner_name,
        p.email,
        p.phone,
        p.created_at,
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        COUNT(s.id) as total_sales,
        COALESCE(SUM(
          (SELECT SUM(quantity) FROM sale_items WHERE sale_id = s.id)
        ), 0) as total_units
      FROM partners p
      LEFT JOIN sales s ON p.id = s.partner_id ${dateFilter}
      WHERE p.id = $1
      GROUP BY p.id, p.partner_name, p.email, p.phone, p.created_at
    `, dateParams);

    if (partnerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Partner's Best Products
    const bestProductsResult = await pool.query(`
      SELECT
        pr.product_name,
        COALESCE(SUM(si.total), 0) as revenue,
        COALESCE(SUM(si.quantity), 0) as units_sold,
        COUNT(DISTINCT si.sale_id) as sales_count
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products pr ON si.product_id = pr.id
      WHERE s.partner_id = $1 ${dateFilter.replace('AND s.created_at', 'AND si.created_at')}
      GROUP BY pr.id, pr.product_name
      ORDER BY revenue DESC
      LIMIT 10
    `, dateParams);

    // Partner's Sales Timeline
    const salesTimelineResult = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as sales_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM sales
      WHERE partner_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [partnerId]);

    // Partner's Current Inventory
    const inventoryResult = await pool.query(`
      SELECT
        pr.product_name,
        pi.stock,
        pr.mrp,
        pr.partner_price
      FROM partner_inventory pi
      JOIN products pr ON pi.product_id = pr.id
      WHERE pi.partner_id = $1 AND pi.stock > 0
      ORDER BY pi.stock DESC
    `, [partnerId]);

    return res.json({
      success: true,
      partner: {
        name: partnerResult.rows[0].partner_name,
        email: partnerResult.rows[0].email,
        phone: partnerResult.rows[0].phone,
        joinedDate: partnerResult.rows[0].created_at,
        totalRevenue: parseFloat(partnerResult.rows[0].total_revenue || 0),
        totalSales: parseInt(partnerResult.rows[0].total_sales || 0),
        totalUnits: parseInt(partnerResult.rows[0].total_units || 0)
      },
      bestProducts: bestProductsResult.rows,
      salesTimeline: salesTimelineResult.rows,
      inventory: inventoryResult.rows
    });
  } catch (err) {
    console.error('Partner analytics error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Product analytics
app.get('/api/analytics/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Product Overview
    const productResult = await pool.query(`
      SELECT
        pr.product_name,
        pr.mrp,
        pr.partner_price,
        pr.current_stock,
        pr.in_circulation,
        COALESCE(SUM(si.total), 0) as total_revenue,
        COALESCE(SUM(si.quantity), 0) as total_units_sold,
        COUNT(DISTINCT si.sale_id) as total_sales
      FROM products pr
      LEFT JOIN sale_items si ON pr.id = si.product_id
      WHERE pr.id = $1
      GROUP BY pr.id
    `, [productId]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Performance by Partner
    const partnerPerformanceResult = await pool.query(`
      SELECT
        p.partner_name,
        COALESCE(SUM(si.total), 0) as revenue,
        COALESCE(SUM(si.quantity), 0) as units_sold,
        COUNT(DISTINCT si.sale_id) as sales_count
      FROM partners p
      LEFT JOIN sales s ON p.id = s.partner_id
      LEFT JOIN sale_items si ON s.id = si.sale_id AND si.product_id = $1
      WHERE p.partner_type = 'partner'
      GROUP BY p.id, p.partner_name
      HAVING SUM(si.quantity) > 0
      ORDER BY revenue DESC
    `, [productId]);

    return res.json({
      success: true,
      product: productResult.rows[0],
      partnerPerformance: partnerPerformanceResult.rows
    });
  } catch (err) {
    console.error('Product analytics error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Turnover and cycle metrics
app.get('/api/analytics/turnover', async (req, res) => {
  try {
    // Average order to delivery time
    const avgDeliveryTimeResult = await pool.query(`
      SELECT
        AVG(EXTRACT(EPOCH FROM (status_changed_at - created_at))/86400) as avg_days
      FROM orders
      WHERE status IN ('Shipped', 'Delivered')
    `);

    // Stock turnover by product
    const stockTurnoverResult = await pool.query(`
      SELECT
        pr.product_name,
        pr.current_stock,
        pr.in_circulation,
        COALESCE(SUM(si.quantity), 0) as total_sold,
        CASE
          WHEN pr.current_stock + pr.in_circulation > 0
          THEN COALESCE(SUM(si.quantity), 0)::float / (pr.current_stock + pr.in_circulation)
          ELSE 0
        END as turnover_rate
      FROM products pr
      LEFT JOIN sale_items si ON pr.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id AND s.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY pr.id, pr.product_name, pr.current_stock, pr.in_circulation
      ORDER BY turnover_rate DESC
    `);

    // Order status distribution
    const orderStatusResult = await pool.query(`
      SELECT
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total_value
      FROM orders
      GROUP BY status
    `);

    return res.json({
      success: true,
      avgDeliveryDays: parseFloat(avgDeliveryTimeResult.rows[0].avg_days || 0),
      stockTurnover: stockTurnoverResult.rows,
      orderStatus: orderStatusResult.rows
    });
  } catch (err) {
    console.error('Turnover analytics error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Catch-all route to serve React app for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

-- Railway PostgreSQL Schema
-- Run this on your Railway PostgreSQL database

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- Partners table (replaces users)
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    partner_type VARCHAR(20) NOT NULL CHECK (partner_type IN ('admin', 'partner')),
    partner_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    partner_price NUMERIC(10,2) NOT NULL,
    mrp NUMERIC(10,2) NOT NULL,
    current_stock INTEGER DEFAULT 0 NOT NULL,
    pending_orders INTEGER DEFAULT 0 NOT NULL,
    in_circulation INTEGER DEFAULT 0 NOT NULL,
    pending_units INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    partner_id INTEGER REFERENCES partners(id),
    status VARCHAR(50) DEFAULT 'Order Created',
    created_by VARCHAR(20) DEFAULT 'admin',
    delivery_date DATE,
    delivery_channel VARCHAR(50),
    total_amount NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner Inventory table
CREATE TABLE IF NOT EXISTS partner_inventory (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    stock INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(partner_id, product_id)
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    sale_id VARCHAR(255) UNIQUE NOT NULL,
    partner_id INTEGER REFERENCES partners(id),
    total_amount NUMERIC(10,2) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(15),
    customer_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sale Items table
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_userid ON partners(userid);
CREATE INDEX IF NOT EXISTS idx_partner_inventory_partner ON partner_inventory(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_inventory_product ON partner_inventory(product_id);

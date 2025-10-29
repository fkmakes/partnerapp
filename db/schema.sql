-- Create database (run this manually first)
-- CREATE DATABASE partnerapp_db;

-- Connect to the database and create table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  userid VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on userid for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_userid ON users(userid);

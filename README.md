# Partner App - Login System

A login application with role-based routing built with Node.js Express backend, React frontend, and PostgreSQL database.

## Features

- User authentication with userid and password
- PostgreSQL database integration
- Password hashing with bcrypt
- Role-based routing (Admin/User dashboards)
- Protected routes
- Responsive login page design

## Project Structure

```
partnerapp/
├── server.js           # Express backend server
├── package.json        # Backend dependencies
├── .env               # Environment variables
├── db/
│   ├── config.js      # Database configuration
│   ├── schema.sql     # Database schema
│   └── init.js        # Database initialization script
├── client/            # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Login.css
│   │   │   ├── AdminDashboard.js
│   │   │   ├── UserDashboard.js
│   │   │   └── Dashboard.css
│   │   └── App.js
│   └── package.json   # Frontend dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Installation

### 1. PostgreSQL Setup

Install PostgreSQL if you haven't already:
```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb partnerapp_db
```

### 2. Environment Configuration

The `.env` file is already created with default values:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=partnerapp_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5000
```

**Update these values** to match your PostgreSQL configuration.

### 3. Backend Setup

Install backend dependencies:
```bash
npm install
```

Initialize database (creates tables and seeds initial users):
```bash
npm run db:init
```

### 4. Frontend Setup

Navigate to client directory and install frontend dependencies:
```bash
cd client
npm install
cd ..
```

## Running the Application

### Option 1: Run backend and frontend separately

**Terminal 1 - Start Backend Server:**
```bash
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Start React Frontend:**
```bash
cd client
npm start
# React app runs on http://localhost:3000
```

### Option 2: Run both concurrently (after installing concurrently)

```bash
npm run dev:all
```

## Test Credentials

### Admin User
- **User ID:** admin
- **Password:** admin123
- **Redirects to:** Admin Dashboard

### Regular User
- **User ID:** user
- **Password:** user123
- **Redirects to:** User Dashboard

## API Endpoint

### POST /api/login

**Request Body:**
```json
{
  "userid": "admin",
  "password": "admin123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "userType": "admin",
  "userid": "admin"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Technologies Used

- **Backend:** Node.js, Express, CORS, Body-Parser, bcrypt
- **Database:** PostgreSQL
- **Frontend:** React, React Router DOM
- **Styling:** CSS3

## How It Works

1. User enters userid and password on the login page
2. Frontend sends POST request to backend `/api/login` endpoint
3. Backend queries PostgreSQL database for user
4. Password is verified using bcrypt hash comparison
5. On success, backend returns user type (admin/user)
6. Frontend stores user info in localStorage
7. User is redirected to appropriate dashboard based on user type
8. Protected routes ensure only authenticated users can access dashboards
9. Logout button clears localStorage and redirects to login page

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  userid VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

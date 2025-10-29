import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminHome from './components/AdminHome';
import AddPartner from './components/AddPartner';
import ViewPartners from './components/ViewPartners';
import AddProduct from './components/AddProduct';
import ViewProducts from './components/ViewProducts';
import CreateOrder from './components/CreateOrder';
import ViewOrders from './components/ViewOrders';
import PartnerDashboard from './components/PartnerDashboard';
import PartnerHome from './components/PartnerHome';
import CreateSale from './components/CreateSale';
import PartnerCreateOrder from './components/PartnerCreateOrder';
import PartnerViewOrders from './components/PartnerViewOrders';
import AdminAnalytics from './components/AdminAnalytics';

// Protected Route Component
function ProtectedRoute({ children, requiredPartnerType }) {
  // Check both localStorage and sessionStorage for partner data
  const partner = JSON.parse(
    localStorage.getItem('partner') ||
    sessionStorage.getItem('partner') ||
    '{}'
  );

  if (!partner.userid) {
    return <Navigate to="/" replace />;
  }

  if (requiredPartnerType && partner.partnerType !== requiredPartnerType) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredPartnerType="admin">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-partner"
          element={
            <ProtectedRoute requiredPartnerType="admin">
              <AddPartner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partners"
          element={
            <ProtectedRoute requiredPartnerType="admin">
              <ViewPartners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute requiredPartnerType="admin">
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute requiredPartnerType="admin">
              <ViewProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-order"
          element={
            <ProtectedRoute requiredPartnerType="admin">
              <CreateOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute requiredPartnerType="admin">
              <ViewOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredPartnerType="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredPartnerType="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredPartnerType="admin">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner-dashboard"
          element={
            <ProtectedRoute requiredPartnerType="partner">
              <PartnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/home"
          element={
            <ProtectedRoute requiredPartnerType="partner">
              <PartnerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/create-sale"
          element={
            <ProtectedRoute requiredPartnerType="partner">
              <CreateSale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/create-order"
          element={
            <ProtectedRoute requiredPartnerType="partner">
              <PartnerCreateOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/orders"
          element={
            <ProtectedRoute requiredPartnerType="partner">
              <PartnerViewOrders />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

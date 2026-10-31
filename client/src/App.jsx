import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InventoryManagement from './pages/InventoryManagement';
import BloodRequestsPage from './pages/BloodRequestsPage';
import DonationCampsPage from './pages/DonationCampsPage';
import CompatibilityChecker from './pages/CompatibilityChecker';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-red-500 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/camps" element={<DonationCampsPage />} />
              <Route path="/compatibility" element={<CompatibilityChecker />} />

              {/* Protected Donor Route */}
              <Route
                path="/donor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['donor', 'admin', 'superadmin']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Recipient / Hospital Route */}
              <Route
                path="/recipient-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['recipient', 'hospital', 'admin', 'superadmin']}>
                    <RecipientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/inventory"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <InventoryManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/requests"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <BloodRequestsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

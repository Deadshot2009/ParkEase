import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ParkingDetail from './pages/ParkingDetail';
import BookingConfirmation from './pages/BookingConfirmation';
import QRTicket from './pages/QRTicket';
import BookingHistory from './pages/BookingHistory';
import GateScanner from './pages/GateScanner';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';

// Loading splash for session restoration
const SessionLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
    <span className="text-xs text-slate-400 font-mono tracking-wider">Restoring Session...</span>
  </div>
);

// Protected route for authenticated users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SessionLoader />;

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

// Strict Protected route for Administrators only
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <SessionLoader />;

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Automatic mode & port aware routing: When in Admin mode or port 3001, route directly to Admin portal
const AdminPortRedirect = ({ children }) => {
  const location = useLocation();
  const isAdminApp = 
    import.meta.env.VITE_APP_MODE === 'admin' || 
    window.location.port === '3001' || 
    window.location.hostname.includes('admin');

  if (isAdminApp && location.pathname === '/') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative flex flex-col min-h-screen text-slate-100 overflow-x-hidden bg-[#080C15]">
          
          {/* Ambient Lighting & Architectural Glow Layers */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-indigo-600/15 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 -right-40 w-[34rem] h-[34rem] bg-cyan-500/12 rounded-full blur-[160px]" />
            <div className="absolute bottom-10 left-1/4 w-[38rem] h-[38rem] bg-indigo-500/10 rounded-full blur-[180px]" />
            <div className="absolute inset-0 bg-grid-pattern opacity-35" />
            <div className="absolute inset-0 bg-parking-stripes opacity-25" />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<AdminPortRedirect><LandingPage /></AdminPortRedirect>} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/parking/:id" element={<ParkingDetail />} />
                <Route path="/ticket/:id" element={<QRTicket />} />
                <Route path="/gate-scanner" element={<GateScanner />} />
                
                {/* Protected Driver Routes */}
                <Route
                  path="/booking/confirm"
                  element={
                    <ProtectedRoute>
                      <BookingConfirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <BookingHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Strict Admin Protected Route */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/signup" element={<AuthPage mode="signup" />} />
                <Route path="/register" element={<AuthPage mode="signup" />} />
                <Route path="/admin-login" element={<AuthPage mode="login" />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

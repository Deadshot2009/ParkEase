import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#0A1128] text-white">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/parking/:id" element={<ParkingDetail />} />
              <Route path="/booking/confirm" element={<BookingConfirmation />} />
              <Route path="/ticket/:id" element={<QRTicket />} />
              <Route path="/history" element={<BookingHistory />} />
              <Route path="/gate-scanner" element={<GateScanner />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

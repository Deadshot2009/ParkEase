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
        <div className="relative flex flex-col min-h-screen text-slate-100 overflow-x-hidden">
          
          {/* Ambient Lighting & Architectural Glow Layers */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/4 -right-40 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[140px]" />
            <div className="absolute bottom-10 left-1/3 w-[36rem] h-[36rem] bg-emerald-600/5 rounded-full blur-[160px]" />
            <div className="absolute inset-0 bg-grid-pattern opacity-40" />
            <div className="absolute inset-0 bg-parking-stripes opacity-30" />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
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
        </div>
      </Router>
    </AuthProvider>
  );
}

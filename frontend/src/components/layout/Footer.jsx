import React, { useState } from 'react';
import { SquareParking, Shield, Zap, Clock, MapPin, Mail, Phone, ChevronRight, X, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [modalContent, setModalContent] = useState(null); // 'privacy', 'terms', 'security'

  return (
    <footer className="relative bg-[#070A12] border-t border-white/[0.08] text-slate-400 text-sm overflow-hidden z-10">
      {/* Background glow accent in footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-indigo-500/[0.06] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <SquareParking className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Park<span className="text-cyan-400">Ease</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's premier commercial smart parking and automated EV bay reservation infrastructure. Guaranteed slot locked before you arrive.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-cyan-400 font-semibold">
              <span className="flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/25">
                <Shield className="w-3.5 h-3.5" /> 256-bit Encrypted
              </span>
              <span className="flex items-center gap-1 bg-indigo-500/15 px-2.5 py-1 rounded-full border border-indigo-500/30 text-indigo-300">
                <Zap className="w-3.5 h-3.5" /> Real-Time Sync
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-cyan-300 transition-colors flex items-center gap-1 text-slate-300">
                  <ChevronRight className="w-3 h-3 text-cyan-500" /> Find Parking Hubs
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-cyan-300 transition-colors flex items-center gap-1 text-slate-300">
                  <ChevronRight className="w-3 h-3 text-cyan-500" /> My Reservations
                </Link>
              </li>
              <li>
                <Link to="/gate-scanner" className="hover:text-cyan-300 transition-colors flex items-center gap-1 text-slate-300">
                  <ChevronRight className="w-3 h-3 text-cyan-500" /> Barrier QR Scanner
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-cyan-300 transition-colors flex items-center gap-1 text-slate-300">
                  <ChevronRight className="w-3 h-3 text-cyan-500" /> Live Bay Availability
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Architecture
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/dashboard?search=EV" className="flex items-center gap-2 hover:text-cyan-300 transition-colors">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> Fast EV Charging Bays (CCS2/Type-2)
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="flex items-center gap-2 hover:text-cyan-300 transition-colors">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Dynamic Duration Pricing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="flex items-center gap-2 hover:text-cyan-300 transition-colors">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> Anti Double-Booking Lock
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="flex items-center gap-2 hover:text-cyan-300 transition-colors">
                  <SquareParking className="w-3.5 h-3.5 text-cyan-400" /> Floor-by-Floor Visual Layout
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Support & Network
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> Bengaluru, Delhi NCR, Mumbai</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-cyan-400" /> support@parkease.com</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-cyan-400" /> 1800-PARK-EASE (Toll-Free)</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 ParkEase Mobility Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <button
              onClick={() => setModalContent('privacy')}
              className="hover:text-cyan-300 text-xs transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setModalContent('terms')}
              className="hover:text-cyan-300 text-xs transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setModalContent('security')}
              className="hover:text-cyan-300 text-xs transition-colors cursor-pointer"
            >
              Security Standards
            </button>
          </div>
        </div>
      </div>

      {/* Policy & Info Modals */}
      {modalContent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white capitalize">
                  {modalContent === 'privacy' && 'ParkEase Privacy Policy'}
                  {modalContent === 'terms' && 'Terms of Service'}
                  {modalContent === 'security' && 'Security & Encryption Standards'}
                </h3>
              </div>
              <button
                onClick={() => setModalContent(null)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 space-y-3.5 text-xs text-slate-300 max-h-80 overflow-y-auto leading-relaxed">
              {modalContent === 'privacy' && (
                <>
                  <p>ParkEase is committed to protecting user privacy and securing personal transportation records.</p>
                  <p><strong className="text-white">1. Data Collected:</strong> Account email, vehicle license plates, and booking timestamps are encrypted and solely used to authorize parking entry and generate valid invoices.</p>
                  <p><strong className="text-white">2. Gate Scanning:</strong> QR codes contain temporary cryptographic tokens that expire immediately upon parking duration completion.</p>
                  <p><strong className="text-white">3. Third Parties:</strong> We never sell, lease, or share license plate numbers or user contact information with third-party advertisers.</p>
                </>
              )}

              {modalContent === 'terms' && (
                <>
                  <p>By using ParkEase services, drivers agree to abide by facility parking safety guidelines and designated bay assignments.</p>
                  <p><strong className="text-white">1. Guaranteed Bays:</strong> A booked slot is held exclusively for the registered vehicle during the duration selected at checkout.</p>
                  <p><strong className="text-white">2. Overstay Policy:</strong> Exceeding booking duration without extension may result in standard facility overtime charges upon exit barrier scan.</p>
                  <p><strong className="text-white">3. Cancellation & Refunds:</strong> Reservations can be cancelled from the Booking History dashboard before scheduled entry for an automated refund.</p>
                </>
              )}

              {modalContent === 'security' && (
                <>
                  <p>ParkEase implements institutional security controls to protect payment credentials and facility IoT operations.</p>
                  <p><strong className="text-white">1. Passwords & Auth:</strong> Passwords are protected using bcrypt 10-round salted hashes. Sessions are guarded with HttpOnly SameSite authentication cookies.</p>
                  <p><strong className="text-white">2. Barrier Anti-Duplication:</strong> Boom barrier QR tokens incorporate one-time cryptographic nonces preventing screenshot replay attacks.</p>
                  <p><strong className="text-white">3. Concurrency Serializer:</strong> Double bookings are mathematically eliminated through in-memory race condition mutex locks.</p>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-5 py-2 rounded-xl btn-primary text-xs font-bold"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}

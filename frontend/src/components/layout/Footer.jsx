import React from 'react';
import { SquareParking, Shield, Zap, Clock, MapPin, Mail, Phone, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative bg-[#03060E] border-t border-white/[0.08] text-slate-400 text-sm overflow-hidden z-10">
      {/* Background glow accent in footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/[0.04] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E676] to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <SquareParking className="w-5 h-5 text-[#040711] stroke-[2.5]" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Park<span className="text-emerald-400">Ease</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's premier commercial smart parking and automated EV bay reservation infrastructure. Guaranteed slot locked before you arrive.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-emerald-400 font-semibold">
              <span className="flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" /> 256-bit Encrypted
              </span>
              <span className="flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Zap className="w-3.5 h-3.5" /> Real-Time Sync
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-emerald-300 transition-colors flex items-center gap-1 text-slate-300">
                  <ChevronRight className="w-3 h-3 text-emerald-500" /> Find Parking Hubs
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-emerald-300 transition-colors flex items-center gap-1 text-slate-300">
                  <ChevronRight className="w-3 h-3 text-emerald-500" /> My Reservations
                </Link>
              </li>
              <li>
                <Link to="/gate-scanner" className="hover:text-emerald-300 transition-colors flex items-center gap-1 text-slate-300">
                  <ChevronRight className="w-3 h-3 text-emerald-500" /> Barrier QR Scanner
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-300 transition-colors flex items-center gap-1 text-slate-300">
                  <ChevronRight className="w-3 h-3 text-emerald-500" /> Operator Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Architecture
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Fast EV Charging Bays (CCS2/Type-2)</li>
              <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-emerald-400" /> Dynamic Duration Pricing</li>
              <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Anti Double-Booking Lock</li>
              <li className="flex items-center gap-2"><SquareParking className="w-3.5 h-3.5 text-emerald-400" /> Floor-by-Floor Visual Layout</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Support & Network
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Bengaluru, Delhi NCR, Mumbai</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-emerald-400" /> support@parkease.com</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-400" /> 1800-PARK-EASE (Toll-Free)</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 ParkEase Mobility Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

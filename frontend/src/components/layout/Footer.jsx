import React from 'react';
import { SquareParking, Shield, Zap, Clock, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#050B18] border-t border-gray-800 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C853] flex items-center justify-center">
                <SquareParking className="w-5 h-5 text-[#0A1128] stroke-[2.5]" />
              </div>
              <span className="text-xl font-black text-white">
                Park<span className="text-[#00C853]">Ease</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              India's premier commercial smart parking and automated EV bay reservation infrastructure. Guaranteed slot before you arrive.
            </p>
            <div className="flex items-center space-x-3 text-xs text-emerald-400 font-medium">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 256-bit Encrypted</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Real-Time Sync</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Find Parking Hubs</Link></li>
              <li><Link to="/history" className="hover:text-emerald-400 transition-colors">My Reservations</Link></li>
              <li><Link to="/gate-scanner" className="hover:text-emerald-400 transition-colors">Barrier QR Scanner</Link></li>
              <li><Link to="/admin" className="hover:text-emerald-400 transition-colors">Operator Dashboard</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Features</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-emerald-400" /> Fast EV Charging Bays</li>
              <li className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-emerald-400" /> Dynamic Duration Pricing</li>
              <li className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-emerald-400" /> Anti Double-Booking Lock</li>
              <li className="flex items-center gap-1.5"><SquareParking className="w-3 h-3 text-emerald-400" /> Floor-by-Floor Visual Layout</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Support & Network</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Bengaluru, Delhi NCR, Mumbai</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /> support@parkease.com</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> 1800-PARK-EASE (Toll-Free)</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© 2026 ParkEase Mobility Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-300 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

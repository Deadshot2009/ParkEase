import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  SquareParking, 
  Car, 
  QrCode, 
  History, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  Compass,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 rounded-xl blur-md group-hover:bg-indigo-400/50 transition-all"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <SquareParking className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                Park<span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">Ease</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase -mt-1 hidden sm:block">
                Smart Mobility
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
            <Link
              to="/dashboard"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive('/dashboard')
                  ? 'bg-indigo-500/20 text-cyan-300 border border-indigo-500/40 shadow-indigo-glow'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              Find Parking
            </Link>

            <Link
              to="/history"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive('/history')
                  ? 'bg-indigo-500/20 text-cyan-300 border border-indigo-500/40 shadow-indigo-glow'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <History className="w-4 h-4 text-cyan-400" />
              My Bookings
            </Link>

            <Link
              to="/gate-scanner"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive('/gate-scanner')
                  ? 'bg-indigo-500/20 text-cyan-300 border border-indigo-500/40 shadow-indigo-glow'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              Gate Barrier Scan
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive('/admin')
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_18px_rgba(245,158,11,0.25)]'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Admin Console
              </Link>
            )}
          </nav>

          {/* User Section & Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 pr-3.5 rounded-full glass-panel hover:border-indigo-500/40 transition-all border border-white/10"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500/40"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-tight">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-cyan-400 font-mono">
                      {isAdmin ? 'ADMIN' : 'DRIVER'}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl border border-white/10 py-2 px-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-white/[0.08]">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-3 py-2 mt-1 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Compass className="w-4 h-4 mr-2.5 text-cyan-400" />
                      Find Parking
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <History className="w-4 h-4 mr-2.5 text-cyan-400" />
                      My Bookings & Passes
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-3 py-2 rounded-xl text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2.5 text-amber-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-white/[0.08] my-1.5"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="flex items-center w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-xs font-bold btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-white/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/[0.06]"
          >
            <Compass className="w-4 h-4 mr-3 text-cyan-400" />
            Find Parking
          </Link>
          <Link
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/[0.06]"
          >
            <History className="w-4 h-4 mr-3 text-cyan-400" />
            My Bookings
          </Link>
          <Link
            to="/gate-scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/[0.06]"
          >
            <QrCode className="w-4 h-4 mr-3 text-cyan-400" />
            Gate Barrier Scanner
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/10"
            >
              <ShieldCheck className="w-4 h-4 mr-3 text-amber-400" />
              Admin Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-white/[0.08]">
            {user ? (
              <div className="space-y-2">
                <div className="px-3.5 py-1.5 text-xs text-slate-400">
                  Signed in as <span className="font-semibold text-white">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-xs font-bold text-slate-200 bg-white/[0.06] rounded-xl border border-white/10"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-xs font-bold btn-primary rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

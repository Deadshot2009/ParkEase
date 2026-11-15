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
    <header className="sticky top-0 z-50 bg-[#060B18]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-md group-hover:bg-emerald-400/50 transition-all"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E676] to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <SquareParking className="w-6 h-6 text-[#040711] stroke-[2.5]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                Park<span className="text-emerald-400 drop-shadow-[0_0_12px_rgba(0,230,118,0.4)]">Ease</span>
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
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-emerald-glow'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              Find Parking
            </Link>

            <Link
              to="/history"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive('/history')
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-emerald-glow'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              <History className="w-4 h-4 text-emerald-400" />
              My Bookings
            </Link>

            <Link
              to="/gate-scanner"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive('/gate-scanner')
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-emerald-glow'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
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
                  className="flex items-center space-x-3 bg-navy-800/80 hover:bg-navy-700/80 border border-white/10 rounded-full py-1.5 pl-2 pr-3.5 transition-all focus:outline-none hover:border-emerald-500/40 shadow-card-subtle"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500/70"
                  />
                  <div className="text-left text-xs">
                    <p className="font-semibold text-white leading-tight">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-emerald-400 font-medium capitalize">{user.role}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-3 w-60 glass-panel rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2.5 border-b border-white/[0.08] mb-1">
                      <p className="text-[11px] text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                      <Car className="w-4 h-4 mr-2.5 text-emerald-400" />
                      Saved Vehicles ({user.vehicles?.length || 0})
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                      <History className="w-4 h-4 mr-2.5 text-emerald-400" />
                      Booking History
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition-colors"
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
                  className="px-4 py-2 rounded-xl text-xs font-bold btn-emerald"
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
              className="p-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white border border-white/10 focus:outline-none"
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
            <Compass className="w-4 h-4 mr-3 text-emerald-400" />
            Find Parking
          </Link>
          <Link
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/[0.06]"
          >
            <History className="w-4 h-4 mr-3 text-emerald-400" />
            My Bookings
          </Link>
          <Link
            to="/gate-scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/[0.06]"
          >
            <QrCode className="w-4 h-4 mr-3 text-emerald-400" />
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
                  className="text-center py-2.5 text-xs font-bold btn-emerald rounded-xl"
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

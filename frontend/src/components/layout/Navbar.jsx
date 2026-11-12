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
    <header className="sticky top-0 z-50 bg-[#0A1128]/95 backdrop-blur-md border-b border-gray-800 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00C853] to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <SquareParking className="w-6 h-6 text-[#0A1128] stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                Park<span className="text-[#00C853]">Ease</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase -mt-1 hidden sm:block">
                Smart Mobility
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard')
                  ? 'bg-emerald-500/10 text-[#00C853] border border-emerald-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Find Parking
            </Link>

            <Link
              to="/history"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/history')
                  ? 'bg-emerald-500/10 text-[#00C853] border border-emerald-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              My Bookings
            </Link>

            <Link
              to="/gate-scanner"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/gate-scanner')
                  ? 'bg-emerald-500/10 text-[#00C853] border border-emerald-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              Gate Barrier Scan
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
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
                  className="flex items-center space-x-3 bg-gray-800/80 hover:bg-gray-800 border border-gray-700/60 rounded-full py-1.5 pl-2 pr-3 transition-all focus:outline-none"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500/60"
                  />
                  <div className="text-left text-xs">
                    <p className="font-semibold text-white leading-tight">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-emerald-400 font-medium capitalize">{user.role}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-[#0f172a] rounded-xl shadow-2xl border border-gray-700 py-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <Car className="w-4 h-4 mr-2 text-emerald-400" />
                      Saved Vehicles ({user.vehicles?.length || 0})
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <History className="w-4 h-4 mr-2 text-emerald-400" />
                      Booking History
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-amber-400 hover:bg-gray-800"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-gray-800 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#00C853] hover:bg-[#00b54b] text-[#0A1128] font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
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
              className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A1128] border-b border-gray-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800"
          >
            <Compass className="w-4 h-4 mr-3 text-emerald-400" />
            Find Parking
          </Link>
          <Link
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800"
          >
            <History className="w-4 h-4 mr-3 text-emerald-400" />
            My Bookings
          </Link>
          <Link
            to="/gate-scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800"
          >
            <QrCode className="w-4 h-4 mr-3 text-emerald-400" />
            Gate Barrier Scanner
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 hover:bg-gray-800"
            >
              <ShieldCheck className="w-4 h-4 mr-3" />
              Admin Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-gray-800">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-xs text-gray-400">
                  Signed in as <span className="font-semibold text-white">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-gray-200 bg-gray-800 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold bg-[#00C853] text-[#0A1128] rounded-lg"
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

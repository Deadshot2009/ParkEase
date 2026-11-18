import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  SquareParking, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ShieldCheck, 
  Shield 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ForceChangePasswordModal from '../components/auth/ForceChangePasswordModal';

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, adminLogin, register } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  // Admin portal is strictly HIDDEN from public view; only accessible via secret /admin-login route or ?portal=admin
  const isHiddenAdminPortal = location.pathname === '/admin-login' || searchParams.get('portal') === 'admin';

  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password reset enforcement modal state
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let loggedUser;
      if (isHiddenAdminPortal) {
        // Strict Admin Authentication via dedicated endpoint
        loggedUser = await adminLogin(email, password);

        // Check if Admin must change temporary password
        if (loggedUser?.mustChangePassword) {
          setShowPasswordChangeModal(true);
          return;
        }

        navigate('/admin');
        return;
      }

      // Public User Flow (Login or Register)
      if (isLogin) {
        loggedUser = await login(email, password);
      } else {
        loggedUser = await register({ name, email, password, phone });
      }

      // Check if logged-in user is an admin that must change temporary password
      if (loggedUser?.role === 'admin' && loggedUser?.mustChangePassword) {
        setShowPasswordChangeModal(true);
        return;
      }

      if (loggedUser?.role === 'admin' && !searchParams.get('redirect')) {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden py-12">
      
      {/* Background radial gradient accent */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 ${
        isHiddenAdminPortal
          ? 'bg-gradient-to-tr from-amber-600/20 via-indigo-600/20 to-transparent'
          : 'bg-gradient-to-tr from-indigo-600/20 via-cyan-500/10 to-transparent'
      }`}></div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-white/10">
        
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 rounded-xl blur-md group-hover:bg-indigo-400/50 transition-all"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <SquareParking className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Park<span className="text-cyan-400">Ease</span>
            </span>
          </Link>
          
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {isHiddenAdminPortal 
              ? 'Administrator Authentication' 
              : isLogin ? 'Sign In to Your Account' : 'Create Your ParkEase Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isHiddenAdminPortal
              ? 'Project Owner & Infrastructure Control Access'
              : 'Smart slot reservation & automated barrier access'}
          </p>
        </div>

        {/* Public Flow: User Sign In vs Register Toggle ONLY (Zero Admin Options Displayed to Public) */}
        {!isHiddenAdminPortal && (
          <div className="flex border-b border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrorMsg('');
              }}
              className={`flex-1 pb-3 text-xs font-bold transition-all relative ${
                isLogin ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
              {isLogin && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-cyan-glow"></div>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrorMsg('');
              }}
              className={`flex-1 pb-3 text-xs font-bold transition-all relative ${
                !isLogin ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
              {!isLogin && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-cyan-glow"></div>
              )}
            </button>
          </div>
        )}

        {/* Hidden Admin Portal Notice (Only shown on secret /admin-login) */}
        {isHiddenAdminPortal && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 mb-6 text-xs text-amber-200">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-300">Administrative Channel:</span> Exclusive login for ParkEase Owner. Unregistered or normal accounts are denied.
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 mb-6 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name field (Only in Public Registration) */}
          {!isHiddenAdminPortal && !isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              {isHiddenAdminPortal ? 'Administrator Email' : 'Email Address'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isHiddenAdminPortal ? "asjeevaaslm@gmail.com" : "you@example.com"}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Phone field (Public Registration only) */}
          {!isHiddenAdminPortal && !isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number (For Gate SMS)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg ${
              isHiddenAdminPortal
                ? 'bg-gradient-to-r from-amber-600 via-indigo-600 to-indigo-700 hover:from-amber-500 hover:to-indigo-600 border border-amber-400/40 shadow-amber-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-indigo-glow'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isHiddenAdminPortal ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Enter Admin Console</span>
              </>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to ParkEase</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create User Account</span>
              </>
            )}
          </button>
        </form>

      </div>

      {/* Force Change Password Modal for Admin when logging in with temporary password */}
      <ForceChangePasswordModal
        isOpen={showPasswordChangeModal}
        onSuccess={() => {
          setShowPasswordChangeModal(false);
          navigate('/admin');
        }}
      />

    </div>
  );
}

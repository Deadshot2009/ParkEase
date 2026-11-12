import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  SquareParking, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, phone });
      }
      navigate(redirectPath);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click quick login demo helper
  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setErrorMsg('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate(demoEmail.includes('admin') ? '/admin' : redirectPath);
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1128] text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/15 to-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0D1630] border border-gray-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#00C853] flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <SquareParking className="w-6 h-6 text-[#0A1128] stroke-[2.5]" />
            </div>
            <span className="text-2xl font-black text-white">
              Park<span className="text-[#00C853]">Ease</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">
            {isLogin ? 'Sign In to Your Account' : 'Create Your ParkEase Account'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isLogin ? 'Access your garage, reservations, and barrier pass' : 'Join thousands of smart drivers reserving slots in advance'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-gray-900 p-1 rounded-xl mb-6 border border-gray-800">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isLogin ? 'bg-[#00C853] text-[#0A1128] shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isLogin ? 'bg-[#00C853] text-[#0A1128] shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Full Name</label>
              <div className="flex items-center px-3.5 py-2.5 bg-gray-900 rounded-xl border border-gray-700 focus-within:border-emerald-500">
                <User className="w-4 h-4 text-gray-400 mr-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Email Address</label>
            <div className="flex items-center px-3.5 py-2.5 bg-gray-900 rounded-xl border border-gray-700 focus-within:border-emerald-500">
              <Mail className="w-4 h-4 text-gray-400 mr-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Password</label>
            <div className="flex items-center px-3.5 py-2.5 bg-gray-900 rounded-xl border border-gray-700 focus-within:border-emerald-500">
              <Lock className="w-4 h-4 text-gray-400 mr-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Phone Number (Optional)</label>
              <div className="flex items-center px-3.5 py-2.5 bg-gray-900 rounded-xl border border-gray-700 focus-within:border-emerald-500">
                <Phone className="w-4 h-4 text-gray-400 mr-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00C853] hover:bg-[#00b54b] text-[#0A1128] font-black text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Sign In to Dashboard</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Free Account</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Demo Credentials for instantaneous testing */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold text-center mb-3">
            Quick 1-Click Demo Login
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('user@parkease.com', 'user123')}
              className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700/80 text-left transition-colors"
            >
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>Alex Mercer</span>
              </p>
              <p className="text-[10px] text-gray-400">Regular Driver</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin@parkease.com', 'admin123')}
              className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-amber-500/40 text-left transition-colors"
            >
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>Administrator</span>
              </p>
              <p className="text-[10px] text-gray-400">Admin Console</p>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

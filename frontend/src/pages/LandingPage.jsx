import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  SquareParking, 
  Search, 
  MapPin, 
  Clock, 
  Zap, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  Car, 
  ChevronRight,
  Sparkles,
  Smartphone,
  Compass
} from 'lucide-react';
import api from '../services/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/parking/locations');
        if (res.data.success) {
          setLocations(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch popular locations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative text-white overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 border-b border-white/[0.08]">
        {/* Glow orb in hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/15 to-purple-600/15 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-subtle text-cyan-400 text-xs font-semibold mb-6 shadow-cyan-glow border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Smart Parking & Automated EV Bays</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white mb-6">
              Find Your Parking. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-400 to-sky-200 drop-shadow-[0_0_24px_rgba(6,182,212,0.35)]">
                Book Before You Arrive.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
              Never circle for parking again. Reserve guaranteed individual bays, access high-speed EV chargers, pay seamlessly via UPI / Google Pay, and enter with automated barrier QR scan.
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto glass-panel p-2.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-white/10">
              <div className="flex-1 flex items-center px-4 py-2.5 bg-[#0B0F19]/80 rounded-xl border border-white/5 focus-within:border-indigo-500/60 transition-colors">
                <MapPin className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter location, mall, airport, or tech park..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-3.5 btn-primary rounded-xl text-sm transition-all"
              >
                <Search className="w-4 h-4 mr-2 stroke-[2.5]" />
                Check Live Slots
              </button>
            </form>

            {/* Live Platform Highlights */}
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-3xl mx-auto pt-8 border-t border-white/[0.08]">
              <div className="p-4 glass-panel rounded-2xl">
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Guaranteed Bay</p>
              </div>
              <div className="p-4 glass-panel rounded-2xl">
                <p className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">Real-Time</p>
                <p className="text-xs text-slate-400 mt-0.5">Sensor Guidance</p>
              </div>
              <div className="p-4 glass-panel rounded-2xl">
                <p className="text-2xl font-black text-white">&lt; 30s</p>
                <p className="text-xs text-slate-400 mt-0.5">Booking Checkout</p>
              </div>
              <div className="p-4 glass-panel rounded-2xl">
                <p className="text-2xl font-black text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">Instant</p>
                <p className="text-xs text-slate-400 mt-0.5">QR Barrier Pass</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section - Fully Clickable Step Cards */}
      <section className="py-20 lg:py-24 border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Frictionless Experience
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-4">How ParkEase Works in 3 Steps</h2>
            <p className="text-sm text-slate-400 mt-2">Engineered from ground up to eliminate parking anxiety and save valuable transit time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 - Connected to /dashboard */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="relative p-8 rounded-2xl glass-panel-interactive group cursor-pointer hover:border-cyan-500/40"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-black text-lg mb-6 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                Select Location & Slot
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Explore dynamic multi-level parking plans. View open bays (Cyan), booked bays (Rose), or EV slots in real-time, then tap your preferred slot.
              </p>
              <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                Visual Interactive Grid <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 2 - Connected to /dashboard */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="relative p-8 rounded-2xl glass-panel-interactive group cursor-pointer hover:border-cyan-500/40"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-black text-lg mb-6 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                Duration & UPI Payment
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Set duration with dynamic hour calculations. Checkout securely in seconds using Google Pay, PhonePe, Paytm or BHIM UPI.
              </p>
              <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                Zero Double-Booking Guarantee <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 3 - Connected to /gate-scanner */}
            <div 
              onClick={() => navigate('/gate-scanner')}
              className="relative p-8 rounded-2xl glass-panel-interactive group cursor-pointer hover:border-cyan-500/40"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-black text-lg mb-6 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                Scan QR at Boom Barrier
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Arrive at the destination. Show your encrypted mobile QR ticket to the scanner. The barrier automatically lifts and guides you to your bay.
              </p>
              <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                Automated Barrier Verification <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Locations Section */}
      <section className="py-20 lg:py-24 border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Verified Facilities
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-3">Featured Smart Parking Hubs</h2>
            </div>
            <Link
              to="/dashboard"
              className="mt-4 sm:mt-0 inline-flex items-center text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Explore all locations <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 glass-panel rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl">
              <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Parking Locations Available</h3>
              <p className="text-xs text-slate-400 mt-1">Check back soon or explore the driver dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {locations.map((loc) => (
                <div
                  key={loc._id}
                  className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col justify-between group"
                >
                  <Link to={`/parking/${loc._id}`} className="relative h-48 overflow-hidden block">
                    <img
                      src={loc.images?.[0]}
                      alt={loc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-85" />
                    
                    <div className="absolute top-3 left-3 bg-[#0B0F19]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      {loc.availableSlots || 0} Open Bays
                    </div>

                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white border border-white/10">
                      ★ {loc.rating || '4.9'}
                    </div>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/parking/${loc._id}`}>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {loc.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-400 flex items-center mt-1.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-400 shrink-0" />
                        <span className="truncate">{loc.address}</span>
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {loc.amenities?.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/5"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400">Rate from</span>
                        <p className="text-base font-extrabold text-white">
                          ₹{loc.pricing?.hourlyRate || 40}<span className="text-xs text-slate-400 font-normal">/hr</span>
                        </p>
                      </div>

                      <Link
                        to={`/parking/${loc._id}`}
                        className="px-4 py-2 rounded-xl btn-primary text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        Reserve Bay <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Enterprise Reliability
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 leading-tight">
                Built for High-Throughput Modern Smart Facilities
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
                Whether visiting crowded commercial high-rises, lifestyle gallerias, or airport express hubs, ParkEase guarantees your designated bay is waiting exclusively for you.
              </p>

              <div className="mt-8 space-y-4">
                <div 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-start gap-3.5 p-4 rounded-xl glass-panel-subtle border border-white/5 cursor-pointer hover:border-cyan-500/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Millisecond Slot Concurrency</span>
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      In-memory mutual locks serialize simultaneous checkout attempts. Two drivers never get assigned the same bay.
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/dashboard?search=EV')}
                  className="flex items-start gap-3.5 p-4 rounded-xl glass-panel-subtle border border-white/5 cursor-pointer hover:border-indigo-500/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>EV Supercharging Station Guidance</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Filter bays with CCS2 and Type-2 high-speed chargers. Park and charge effortlessly.
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/gate-scanner')}
                  className="flex items-start gap-3.5 p-4 rounded-xl glass-panel-subtle border border-white/5 cursor-pointer hover:border-amber-500/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <QrCode className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Cryptographic Barrier Validation</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Encrypted timed tokens verified by boom barrier scanners, preventing pass duplication or unauthorized entry.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Glass Display */}
            <div className="glass-panel p-8 rounded-3xl border border-white/10 relative shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">PARKEASE GATE AUTOMATION</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  SYSTEM ACTIVE
                </span>
              </div>

              <div className="py-6 space-y-4">
                <div className="p-4 rounded-xl bg-[#070A12]/80 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Verified Plate Number</p>
                    <p className="text-base font-black font-mono text-white">MH-02-CP-8899</p>
                  </div>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    MATCH CONFIRMED
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#070A12]/80 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Assigned Reserved Bay</p>
                    <p className="text-base font-black font-mono text-indigo-400">LEVEL 1 • BAY P1-04 (EV)</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                    BARRIER LIFTED
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] text-center">
                <Link
                  to="/dashboard"
                  className="w-full inline-flex items-center justify-center py-3 rounded-xl btn-primary text-xs font-bold transition-all shadow-md"
                >
                  Experience ParkEase Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

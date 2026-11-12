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
  Smartphone
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
    <div className="min-h-screen bg-[#0A1128] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-gray-800">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-600/20 to-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Smart Parking Reservation 2.0</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white mb-6">
              Find Your Parking. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#00C853] to-teal-200">
                Book Before You Arrive.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Never circle for parking again. Reserve guaranteed individual bays, access high-speed EV chargers, pay seamlessly via UPI / Google Pay, and enter with automated barrier QR scan.
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-gray-900/90 backdrop-blur-md p-2 rounded-2xl border border-gray-700/80 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-2 bg-gray-800/60 rounded-xl border border-gray-700/50">
                <MapPin className="w-5 h-5 text-emerald-400 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter location, mall, airport, or tech park..."
                  className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-[#00C853] hover:bg-[#00b54b] text-[#0A1128] font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] text-sm"
              >
                <Search className="w-4 h-4 mr-2 stroke-[2.5]" />
                Check Live Slots
              </button>
            </form>

            {/* Live Stats Row */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-3xl mx-auto pt-8 border-t border-gray-800/60">
              <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/60">
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-gray-400">Guaranteed Bay</p>
              </div>
              <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/60">
                <p className="text-2xl font-black text-emerald-400">120+</p>
                <p className="text-xs text-gray-400">Smart Hubs</p>
              </div>
              <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/60">
                <p className="text-2xl font-black text-white">&lt; 30s</p>
                <p className="text-xs text-gray-400">Booking Time</p>
              </div>
              <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/60">
                <p className="text-2xl font-black text-emerald-400">Instant</p>
                <p className="text-xs text-gray-400">QR Gate Entry</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#070D1E] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Frictionless Experience</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">How ParkEase Works in 3 Steps</h2>
            <p className="text-sm text-gray-400 mt-2">Engineered from ground up to save you 20+ minutes on every single trip.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-8 rounded-2xl bg-[#0C152E] border border-gray-800/80 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-lg mb-6 border border-emerald-500/30">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Select Location & Slot
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Explore dynamic multi-level parking plans. See available (Green), booked (Red), or EV bays in real-time, then tap your preferred slot.
              </p>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                Visual Interactive Grid <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-2xl bg-[#0C152E] border border-gray-800/80 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-lg mb-6 border border-emerald-500/30">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Duration & UPI Payment
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Set duration with dynamic hour calculations. Checkout securely in seconds using Google Pay, PhonePe, Paytm or BHIM UPI.
              </p>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                Zero Double-Booking Guarantee <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-2xl bg-[#0C152E] border border-gray-800/80 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-lg mb-6 border border-emerald-500/30">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Scan QR at Boom Barrier
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Arrive at the destination. Show your encrypted mobile QR ticket to the scanner. The barrier automatically lifts and guides you to your bay.
              </p>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                Automated Barrier Verification <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Locations Section */}
      <section className="py-20 bg-[#0A1128] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Hot Locations</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">Featured Smart Parking Hubs</h2>
            </div>
            <Link
              to="/dashboard"
              className="mt-4 sm:mt-0 inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View all 120+ hubs <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <div
                key={loc._id}
                className="bg-[#0e1733] border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all shadow-xl flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={loc.images?.[0]}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#0A1128]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {loc.availableSlots} Bays Free
                  </div>
                  <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white">
                    ⭐ {loc.rating} ({loc.reviewCount})
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      {loc.address}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {loc.amenities?.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-[10px] bg-gray-800/70 text-gray-300 px-2 py-0.5 rounded-md">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-gray-400">Starting from</p>
                      <p className="text-lg font-black text-white">
                        ₹{loc.pricing?.hourlyRate} <span className="text-xs font-normal text-gray-400">/ hr</span>
                      </p>
                    </div>

                    <Link
                      to={`/parking/${loc._id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00C853] hover:bg-[#00b54b] text-[#0A1128] transition-transform hover:scale-105"
                    >
                      Select Slot
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 bg-[#070D1E] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Enterprise Reliability</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 leading-tight">
                Designed for Urban Commuters, EV Drivers & Fleet Operators.
              </h2>
              <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                ParkEase replaces outdated ticket dispensers with an intelligent cloud architecture that syncs floor sensors, boom barriers, and payments in real time.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-1">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Dedicated EV Fast Charging Bays</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Filter by CCS2, Type-2, and 50kW DC chargers with reserved parking.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-1">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Anti Double-Booking Backend Engine</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Atomic transaction locks ensure no two users can book the same bay for the same slot.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-1">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Encrypted QR Boarding Pass</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Offline-safe signed QR pass directly to your phone for barrier tap & enter.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-tr from-[#00C853]/20 to-blue-500/20 p-1 rounded-3xl shadow-2xl">
                <div className="bg-[#0B142D] rounded-[22px] p-6 border border-gray-700/60">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs font-semibold text-gray-400 ml-2">Live Floor Grid • Ground Floor (G)</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Live Syncing</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5 my-6">
                    {['G-01', 'G-02', 'G-03', 'G-04', 'G-05', 'G-06', 'G-07', 'G-08'].map((slot, i) => {
                      const isBooked = i === 1 || i === 4;
                      const isEV = i === 0 || i === 2;
                      return (
                        <div
                          key={slot}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isBooked
                              ? 'bg-rose-950/40 border-rose-600/50 text-rose-300'
                              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm'
                          }`}
                        >
                          <p className="text-xs font-black">{slot}</p>
                          <p className="text-[10px] mt-1 font-medium">{isBooked ? 'Booked' : (isEV ? '⚡ EV Free' : 'Available')}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Alex Mercer (MH-02-CP-8899)</p>
                      <p className="text-[11px] text-gray-400">Bay G-02 Reserved • Entry Validated</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#00C853] text-[#0A1128] text-xs font-bold">
                      Barrier Open
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-b from-[#0A1128] to-[#040814] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready for Effortless Parking?
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Join thousands of smart drivers who reserve their spot beforehand and glide into their parking space in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#00C853] hover:bg-[#00b54b] text-[#0A1128] font-black text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
            >
              Explore Parking Hubs
            </Link>
            <Link
              to="/gate-scanner"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm border border-gray-700 transition-all"
            >
              Test Barrier Scanner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

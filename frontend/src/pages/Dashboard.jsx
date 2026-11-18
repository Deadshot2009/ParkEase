import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Car, 
  Zap, 
  ShieldCheck, 
  SlidersHorizontal, 
  ArrowRight, 
  Heart, 
  Plus, 
  QrCode, 
  Check, 
  Compass, 
  Clock, 
  Layers,
  Sparkles,
  Trash2,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, toggleFavorite, addVehicle, removeVehicle } = useAuth();
  const [searchParams] = useSearchParams();
  const [locations, setLocations] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedAmenity, setSelectedAmenity] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ plateNumber: '', makeModel: '', type: 'Car', color: 'White' });
  const [addingVehicle, setAddingVehicle] = useState(false);

  useEffect(() => {
    fetchLocations();
    if (user) {
      fetchUserActiveBookings();
    }
  }, [user]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parking/locations');
      if (res.data.success) {
        setLocations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActiveBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings?status=ACTIVE');
      if (res.data.success) {
        setActiveBookings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.plateNumber || !newVehicle.makeModel) return;
    try {
      setAddingVehicle(true);
      await addVehicle(newVehicle);
      setNewVehicle({ plateNumber: '', makeModel: '', type: 'Car', color: 'White' });
      setShowVehicleModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setAddingVehicle(false);
    }
  };

  // Filter locations
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.tagline?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedAmenity === 'FAVORITES') {
      return user?.favorites?.includes(loc._id);
    }
    if (selectedAmenity === 'EV') {
      return loc.amenities?.some(a => a.toLowerCase().includes('ev'));
    }
    if (selectedAmenity === '24/7') {
      return loc.operatingHours?.includes('24/7');
    }
    return true;
  });

  return (
    <div className="relative text-white pb-24">
      {/* Top Banner with subtle architectural depth */}
      <div className="relative border-b border-white/[0.08] py-8 lg:py-12 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-0 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-indigo-500/15 text-cyan-400 border border-indigo-500/30">
                  Live Reservation Engine
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1.5 ml-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Network Synchronized
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Welcome back, {user ? user.name.split(' ')[0] : 'Driver'} 👋
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Select your parking destination and lock in your guaranteed bay in advance.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowVehicleModal(true)}
                className="px-4 py-2.5 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-xs font-bold text-white border border-white/10 flex items-center gap-2 transition-all hover:border-indigo-500/40"
              >
                <Car className="w-4 h-4 text-cyan-400" />
                <span>My Vehicles ({user?.vehicles?.length || 0})</span>
              </button>

              <Link
                to="/history"
                className="px-4 py-2.5 rounded-xl btn-primary text-xs font-bold flex items-center gap-2 transition-all"
              >
                <QrCode className="w-4 h-4 stroke-[2.5]" />
                <span>Active Passes ({activeBookings.length})</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Active Booking Quick Card (if user has active pass) */}
        {activeBookings.length > 0 && (
          <div className="mb-8 p-5 sm:p-6 rounded-2xl glass-panel border border-indigo-500/40 shadow-indigo-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-indigo-500/30">
                <QrCode className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Active Pass Ready</span>
                  <span className="text-[10px] bg-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    {activeBookings[0].bookingReference}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Slot {activeBookings[0].slotNumber} • {activeBookings[0].locationName}
                </h3>
                <p className="text-xs text-slate-400">
                  Vehicle: <span className="text-slate-200 font-mono font-bold">{activeBookings[0].vehicle?.plateNumber}</span> ({activeBookings[0].vehicle?.makeModel})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to={`/ticket/${activeBookings[0]._id}`}
                className="flex-1 sm:flex-none text-center px-5 py-2.5 rounded-xl btn-cyan text-xs font-bold transition-all shadow-md"
              >
                Show QR at Gate
              </Link>
            </div>
          </div>
        )}

        {/* Search & Amenities Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl shadow-lg mb-8 border border-white/10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Input */}
            <div className="w-full md:w-96 flex items-center px-4 py-2.5 bg-[#0B0F19]/80 rounded-xl border border-white/10 focus-within:border-indigo-500/60 transition-colors">
              <Search className="w-4 h-4 text-cyan-400 mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, mall, airport, or tech park..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-white">
                  Clear
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'All Hubs' },
                { id: 'EV', label: '⚡ Fast EV Chargers' },
                { id: '24/7', label: '🕒 24/7 Access' },
                { id: 'FAVORITES', label: '❤️ Saved Hubs' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedAmenity(pill.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedAmenity === pill.id
                      ? 'bg-indigo-500/25 text-cyan-300 border border-indigo-500/40 shadow-indigo-glow'
                      : 'glass-panel-subtle text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <span>Available Parking Locations</span>
            <span className="text-xs bg-indigo-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-indigo-500/30">
              {filteredLocations.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400">Live slot counts updated via WebSocket</span>
        </div>

        {/* Locations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 glass-panel rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl border border-white/10">
            <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Parking Locations Available</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'No facilities matched your search keywords.' : 'No active parking locations are registered yet.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedAmenity('ALL'); }}
                className="mt-4 px-4 py-2 rounded-xl glass-panel-subtle text-xs font-bold text-cyan-400 hover:text-cyan-300 border border-cyan-500/30"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((loc) => {
              const isFavorite = user?.favorites?.includes(loc._id);

              return (
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 left-3 bg-[#0B0F19]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      {loc.availableSlots || 0} Open Bays
                    </div>

                    {user && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(loc._id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-rose-400 transition-colors border border-white/10 z-10"
                      >
                        <Heart
                          className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                        />
                      </button>
                    )}
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/parking/${loc._id}`}>
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                            {loc.name}
                          </h3>
                        </Link>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 shrink-0">
                          ★ {loc.rating || '4.9'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 flex items-center mt-1.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-400 shrink-0" />
                        <span className="truncate">{loc.address}</span>
                      </p>

                      <p className="text-xs text-slate-300 mt-2 font-light line-clamp-2">
                        {loc.tagline}
                      </p>

                      {/* Amenities Pills - Clickable to filter */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {loc.amenities?.slice(0, 3).map((a, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (a.toLowerCase().includes('ev')) setSelectedAmenity('EV');
                              else if (a.toLowerCase().includes('24/7')) setSelectedAmenity('24/7');
                              else setSearchQuery(a.split(' ')[0]);
                            }}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 border border-white/5 transition-colors"
                          >
                            {a}
                          </button>
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
                        className="px-4 py-2.5 rounded-xl btn-primary text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        Select Slot <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Vehicle Garage Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-cyan-400 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">My Vehicle Garage</h3>
              </div>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Existing Vehicles */}
            <div className="py-4 space-y-2.5 max-h-56 overflow-y-auto">
              {user?.vehicles?.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No vehicles saved yet. Add your license plate below.
                </div>
              ) : (
                user?.vehicles?.map((veh) => (
                  <div
                    key={veh.id || veh.plateNumber}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div>
                      <span className="text-xs font-black font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        {veh.plateNumber}
                      </span>
                      <p className="text-xs text-white font-medium mt-1">
                        {veh.makeModel} <span className="text-[10px] text-slate-400">({veh.type})</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeVehicle(veh.id || veh.plateNumber)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New Vehicle Form */}
            <form onSubmit={handleAddVehicle} className="pt-4 border-t border-white/[0.08] space-y-3">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Add Vehicle to Profile</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Plate (e.g. MH-02-CP-8899)"
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value.toUpperCase() })}
                  className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60 font-mono uppercase"
                />
                <input
                  type="text"
                  required
                  placeholder="Make & Model (e.g. Nexon EV)"
                  value={newVehicle.makeModel}
                  onChange={(e) => setNewVehicle({ ...newVehicle, makeModel: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                >
                  <option value="Car">Sedan / Hatchback / SUV</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                  <option value="Bike">Two-Wheeler</option>
                </select>

                <button
                  type="submit"
                  disabled={addingVehicle}
                  className="flex-1 py-2 rounded-xl btn-primary text-xs font-bold transition-all disabled:opacity-50"
                >
                  {addingVehicle ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

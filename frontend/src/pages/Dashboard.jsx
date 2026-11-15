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
  Trash2
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
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live Reservation Engine
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1.5 ml-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Network Online
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
                className="px-4 py-2.5 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-xs font-bold text-white border border-white/10 flex items-center gap-2 transition-all hover:border-emerald-500/40"
              >
                <Car className="w-4 h-4 text-emerald-400" />
                <span>My Vehicles ({user?.vehicles?.length || 0})</span>
              </button>

              <Link
                to="/history"
                className="px-4 py-2.5 rounded-xl btn-emerald text-xs font-bold flex items-center gap-2 transition-all"
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
          <div className="mb-8 p-5 sm:p-6 rounded-2xl glass-panel border border-emerald-500/30 shadow-emerald-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00E676] to-emerald-500 text-[#040711] flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-emerald-500/20">
                <QrCode className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Pass Ready</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
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
                className="flex-1 sm:flex-none text-center px-5 py-2.5 rounded-xl btn-emerald text-xs font-bold transition-all shadow-md"
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
            <div className="w-full md:w-96 flex items-center px-4 py-2.5 bg-[#040711]/70 rounded-xl border border-white/10 focus-within:border-emerald-500/60 transition-colors">
              <Search className="w-4 h-4 text-emerald-400 mr-3 shrink-0" />
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
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-glow'
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
            <span className="text-xs bg-white/10 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
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
          <div className="text-center py-16 glass-panel rounded-2xl">
            <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No parking hubs match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filter or changing your search terms.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedAmenity('ALL'); }}
              className="mt-4 px-4 py-2 rounded-xl glass-panel-subtle text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((loc) => {
              const isFav = user?.favorites?.includes(loc._id);
              const occupancy = loc.occupancyRate || 0;
              const isHigh = occupancy > 80;

              return (
                <div
                  key={loc._id}
                  className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Image banner */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={loc.images?.[0]}
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060B18] via-transparent to-transparent opacity-80" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-[#060B18]/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          {loc.availableSlots} Free Bays
                        </span>
                        {loc.evSlotsCount > 0 && (
                          <span className="bg-emerald-400 text-[#040711] px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-0.5 shadow-md">
                            <Zap className="w-3 h-3 fill-current" /> {loc.evSlotsCount} EV
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(loc._id)}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors shadow-md ${
                          isFav ? 'bg-rose-500 text-white' : 'bg-[#060B18]/80 text-slate-300 hover:text-white border border-white/10'
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      {/* Distance pill */}
                      <div className="absolute bottom-3 left-3 bg-[#060B18]/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-200 flex items-center gap-1 border border-white/5">
                        <MapPin className="w-3 h-3 text-emerald-400" /> {loc.distance || 'Near you'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {loc.name}
                        </h3>
                        <span className="text-xs font-bold text-amber-400 shrink-0 ml-2">
                          ★ {loc.rating}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {loc.address}
                      </p>

                      {/* Live Occupancy Meter */}
                      <div className="mt-4">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Occupancy</span>
                          <span className={isHigh ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                            {occupancy}% Filled
                          </span>
                        </div>
                        <div className="w-full bg-[#040711] rounded-full h-1.5 overflow-hidden border border-white/5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHigh ? 'bg-rose-500' : 'bg-[#00E676]'
                            }`}
                            style={{ width: `${occupancy}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {loc.amenities?.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white/[0.05] text-slate-300 px-2 py-0.5 rounded-md font-medium border border-white/5"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 pt-0 border-t border-white/[0.08] mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Standard Rate</span>
                      <span className="text-lg font-black text-white">
                        ₹{loc.pricing?.hourlyRate}
                        <span className="text-xs font-normal text-slate-400"> / hr</span>
                      </span>
                    </div>

                    <Link
                      to={`/parking/${loc._id}`}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold btn-emerald"
                    >
                      <span>Choose Bay</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vehicle Management Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl animate-fadeIn border border-white/15">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/[0.08]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-400" />
                <span>My Saved Vehicles</span>
              </h3>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Existing Vehicles list */}
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {user?.vehicles?.length > 0 ? (
                user.vehicles.map(v => (
                  <div key={v.id} className="p-3 bg-[#040711]/70 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white font-mono tracking-wider">{v.plateNumber}</p>
                      <p className="text-[11px] text-slate-400">{v.makeModel} • {v.type}</p>
                    </div>
                    <button
                      onClick={() => removeVehicle(v.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No vehicles saved yet. Add your vehicle below for fast 1-tap bookings.</p>
              )}
            </div>

            {/* Add New Vehicle Form */}
            <form onSubmit={handleAddVehicle} className="space-y-3 pt-3 border-t border-white/[0.08]">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Add New Vehicle</h4>
              
              <div>
                <input
                  type="text"
                  required
                  placeholder="License Plate (e.g. MH-02-CP-8899)"
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                  className="w-full bg-[#040711]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Make & Model (e.g. BMW 320d)"
                  value={newVehicle.makeModel}
                  onChange={(e) => setNewVehicle({ ...newVehicle, makeModel: e.target.value })}
                  className="w-full bg-[#040711]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />

                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                  className="w-full bg-[#040711]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Car">Sedan / Hatchback</option>
                  <option value="SUV">SUV</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                  <option value="Bike">Motorcycle</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={addingVehicle}
                className="w-full py-2.5 rounded-xl btn-emerald text-xs font-bold transition-all mt-2 disabled:opacity-50"
              >
                {addingVehicle ? 'Saving...' : 'Add Vehicle to Garage'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

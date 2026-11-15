import React, { useState, useEffect } from 'react';
import { 
  SquareParking, 
  MapPin, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  BarChart3,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('ANALYTICS'); // ANALYTICS, LOCATIONS, SLOTS, BOOKINGS, USERS
  const [analytics, setAnalytics] = useState(null);
  const [locations, setLocations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New location modal state
  const [showLocModal, setShowLocModal] = useState(false);
  const [newLoc, setNewLoc] = useState({
    name: '',
    address: '',
    tagline: '',
    hourlyRate: 40,
    dayPassRate: 350,
    operatingHours: '24/7 Mon-Sun'
  });

  // Selected location for slot management
  const [selectedLocationId, setSelectedLocationId] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [anRes, locRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/parking/locations')
      ]);

      if (anRes.data.success) setAnalytics(anRes.data.data);
      if (locRes.data.success) {
        setLocations(locRes.data.data);
        if (!selectedLocationId && locRes.data.data.length > 0) {
          setSelectedLocationId(locRes.data.data[0]._id);
        }
      }

      if (activeTab === 'BOOKINGS') {
        const bkRes = await api.get('/admin/bookings');
        if (bkRes.data.success) setBookings(bkRes.data.data);
      } else if (activeTab === 'USERS') {
        const uRes = await api.get('/admin/users');
        if (uRes.data.success) setUsersList(uRes.data.data);
      } else if (activeTab === 'SLOTS') {
        const locId = selectedLocationId || locRes.data.data[0]?._id;
        if (locId) {
          const slRes = await api.get(`/parking/locations/${locId}/slots`);
          if (slRes.data.success) setSlots(slRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/locations', {
        name: newLoc.name,
        address: newLoc.address,
        tagline: newLoc.tagline,
        pricing: { hourlyRate: Number(newLoc.hourlyRate), dayPassRate: Number(newLoc.dayPassRate) },
        operatingHours: newLoc.operatingHours
      });
      if (res.data.success) {
        alert('Parking facility added successfully!');
        setShowLocModal(false);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create location');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Delete this parking facility?')) return;
    try {
      const res = await api.delete(`/admin/locations/${id}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete location');
    }
  };

  const handleUpdateSlotStatus = async (slotId, newStatus) => {
    try {
      const res = await api.put(`/admin/slots/${slotId}`, { status: newStatus });
      if (res.data.success) {
        setSlots(slots.map(s => s._id === slotId ? { ...s, status: newStatus } : s));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update slot status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold">Admin Console Restricted</h2>
        <p className="text-xs text-slate-400 mt-1">
          You must be logged in as an Administrator (e.g. admin@parkease.com) to access this dashboard.
        </p>
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalSpaces: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    totalRevenue: 0,
    totalBookings: 0,
    averageOccupancyRate: 0
  };

  return (
    <div className="relative text-white pb-24">
      
      {/* Top Banner with Glassmorphism */}
      <div className="relative border-b border-white/[0.08] py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Operator Enterprise Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
                ParkEase Commercial Admin Portal
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchAdminData}
                className="px-3.5 py-2.5 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-xs font-bold text-slate-300 flex items-center gap-1.5 border border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
              </button>
              <button
                onClick={() => setShowLocModal(true)}
                className="px-4 py-2.5 rounded-xl btn-emerald text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Add Facility
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
            {[
              { id: 'ANALYTICS', label: '📊 Occupancy & Revenue Analytics' },
              { id: 'LOCATIONS', label: '🏢 Facilities Management' },
              { id: 'SLOTS', label: '🅿️ Live Bay Controller' },
              { id: 'BOOKINGS', label: '📋 All Reservations' },
              { id: 'USERS', label: '👥 User Directory' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'glass-panel-subtle text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* KPI Metrics Cards with Glassmorphism */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Bays</span>
            <p className="text-2xl font-black text-white mt-1">{summary.totalSpaces}</p>
            <span className="text-[10px] text-slate-500">Across all locations</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Available</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{summary.availableSlots}</p>
            <span className="text-[10px] text-slate-500">Ready for booking</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Occupied</span>
            <p className="text-2xl font-black text-rose-400 mt-1">{summary.occupiedSlots}</p>
            <span className="text-[10px] text-slate-500">{summary.averageOccupancyRate}% occupancy</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Total Revenue</span>
            <p className="text-2xl font-black text-white mt-1">₹{summary.totalRevenue}</p>
            <span className="text-[10px] text-emerald-400 font-bold">+18.4% this week</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Total Bookings</span>
            <p className="text-2xl font-black text-white mt-1">{summary.totalBookings}</p>
            <span className="text-[10px] text-slate-500">{summary.activeBookings} active now</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Registered Users</span>
            <p className="text-2xl font-black text-white mt-1">{summary.totalUsers}</p>
            <span className="text-[10px] text-slate-500">Smart Drivers</span>
          </div>
        </div>

        {/* TAB 1: ANALYTICS & CHARTS */}
        {activeTab === 'ANALYTICS' && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Revenue Trend Area Chart (8 cols) */}
              <div className="lg:col-span-8 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Daily Revenue Trend</h3>
                    <p className="text-xs text-slate-400">Total gross earnings across past 7 days</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    UPI Real-Time Verified
                  </span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.revenueTrend}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E676" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#64748b" textAnchor="end" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#070C1B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px' }}
                        formatter={(val) => [`₹${val}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#00E676" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bay Type Distribution Pie (4 cols) */}
              <div className="lg:col-span-4 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Bay Type Breakdown</h3>
                  <p className="text-xs text-slate-400 mb-4">Distribution by equipment and amenities</p>
                  
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.slotDistribution}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="count"
                        >
                          {analytics.slotDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#070C1B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-white/[0.08]">
                  {analytics.slotDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-300">{item.name}: <strong className="text-white">{item.count}</strong></span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Hourly Occupancy Bar Chart */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl">
              <h3 className="text-base font-bold text-white">Peak Hours Occupancy Profile</h3>
              <p className="text-xs text-slate-400 mb-6">Average parking occupancy percentage throughout the day</p>

              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.occupancyByHour}>
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#070C1B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px' }}
                      formatter={(val) => [`${val}%`, 'Occupancy']}
                    />
                    <Bar dataKey="occupancy" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FACILITIES / LOCATIONS MANAGEMENT */}
        {activeTab === 'LOCATIONS' && (
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Managed Facilities</h3>
              <button
                onClick={() => setShowLocModal(true)}
                className="px-4 py-2 rounded-xl btn-emerald text-xs font-bold"
              >
                + Add New Facility
              </button>
            </div>

            <div className="divide-y divide-white/[0.08]">
              {locations.map(loc => (
                <div key={loc._id} className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-white">{loc.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {loc.address}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                      <span>Rate: <strong className="text-white">₹{loc.pricing?.hourlyRate}/h</strong></span>
                      <span>•</span>
                      <span>Bays: <strong className="text-emerald-400">{loc.availableSlots} free</strong> / {loc.totalSlots}</span>
                      <span>•</span>
                      <span>Hours: <strong className="text-white">{loc.operatingHours}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedLocationId(loc._id);
                        setActiveTab('SLOTS');
                      }}
                      className="px-4 py-2 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-xs font-bold text-emerald-400 border border-white/10 transition-colors"
                    >
                      Manage Bays
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc._id)}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SLOTS CONTROLLER */}
        {activeTab === 'SLOTS' && (
          <div className="space-y-6">
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400">Select Facility:</span>
                <select
                  value={selectedLocationId}
                  onChange={(e) => {
                    setSelectedLocationId(e.target.value);
                    fetchAdminData();
                  }}
                  className="bg-[#040711]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  {locations.map(loc => (
                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-slate-400 font-medium">Click dropdown on any slot to change live status</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {slots.map(slot => (
                <div key={slot._id} className="p-3.5 glass-panel-subtle rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-sm text-white">{slot.slotNumber}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{slot.type}</span>
                  </div>

                  <select
                    value={slot.status}
                    onChange={(e) => handleUpdateSlotStatus(slot._id, e.target.value)}
                    className={`w-full text-xs font-bold rounded-xl px-2 py-1.5 focus:outline-none ${
                      slot.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : slot.status === 'booked'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : slot.status === 'reserved'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-[#040711] text-slate-400 border border-white/10'
                    }`}
                  >
                    <option value="available">🟢 Available</option>
                    <option value="booked">🔴 Booked</option>
                    <option value="reserved">🟡 Reserved</option>
                    <option value="unavailable">⚫ Maintenance</option>
                  </select>

                  <p className="text-[10px] text-slate-500 font-mono truncate">{slot.floor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ALL RESERVATIONS */}
        {activeTab === 'BOOKINGS' && (
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-5 sm:p-6 border-b border-white/[0.08] flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Platform Reservations ({bookings.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#040711]/60 text-slate-400 uppercase font-mono border-b border-white/[0.08]">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Facility & Bay</th>
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {bookings.map(b => (
                    <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono font-bold text-white">{b.bookingReference}</td>
                      <td className="p-4">
                        <p className="font-bold text-white">{b.userName}</p>
                        <p className="text-[10px] text-slate-400">{b.userEmail}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">{b.locationName}</p>
                        <p className="text-[10px] text-emerald-400 font-mono font-bold">Bay {b.slotNumber} ({b.floor})</p>
                      </td>
                      <td className="p-4 font-mono text-white font-semibold">{b.vehicle?.plateNumber}</td>
                      <td className="p-4 font-mono font-bold text-white">₹{b.totalAmount}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.bookingStatus === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : b.bookingStatus === 'COMPLETED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: USER DIRECTORY */}
        {activeTab === 'USERS' && (
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-5 sm:p-6 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Registered Accounts ({usersList.length})</h3>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {usersList.map(u => (
                <div key={u._id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3.5">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    <div>
                      <p className="text-sm font-bold text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email} • {u.phone || 'No phone'}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/[0.06] text-slate-300'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Add Location Modal */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="glass-panel rounded-3xl border border-white/15 w-full max-w-lg p-6 sm:p-7 shadow-2xl text-white">
            <div className="flex justify-between items-center pb-3.5 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white">Add New Smart Parking Hub</h3>
              <button onClick={() => setShowLocModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phoenix MarketCity Smart Deck"
                  value={newLoc.name}
                  onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                  className="w-full bg-[#040711]/80 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street, District, City"
                  value={newLoc.address}
                  onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })}
                  className="w-full bg-[#040711]/80 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={newLoc.hourlyRate}
                    onChange={(e) => setNewLoc({ ...newLoc, hourlyRate: e.target.value })}
                    className="w-full bg-[#040711]/80 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    required
                    value={newLoc.operatingHours}
                    onChange={(e) => setNewLoc({ ...newLoc, operatingHours: e.target.value })}
                    className="w-full bg-[#040711]/80 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLocModal(false)}
                  className="px-4 py-2.5 glass-panel-subtle text-slate-300 rounded-xl hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 btn-emerald text-xs font-bold rounded-xl"
                >
                  Create Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

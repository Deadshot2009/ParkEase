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
  Filter,
  Compass,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  X,
  Eye,
  Ban,
  Clock,
  Car
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
import ForceChangePasswordModal from '../components/auth/ForceChangePasswordModal';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('ANALYTICS'); // ANALYTICS, LOCATIONS, SLOTS, BOOKINGS, USERS
  const [analytics, setAnalytics] = useState(null);
  const [locations, setLocations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states for Bookings
  const [bookingFilterStatus, setBookingFilterStatus] = useState('ALL');
  const [bookingFilterLocation, setBookingFilterLocation] = useState('ALL');
  const [bookingFilterDate, setBookingFilterDate] = useState('');

  // Selected user booking history modal state
  const [selectedUserBookings, setSelectedUserBookings] = useState(null);
  const [userBookingsLoading, setUserBookingsLoading] = useState(false);

  // New location modal state
  const [showLocModal, setShowLocModal] = useState(false);
  const [newLoc, setNewLoc] = useState({
    name: '',
    address: '',
    city: 'Bangalore',
    tagline: '',
    hourlyRate: 50,
    operatingHours: '24/7 Mon-Sun'
  });

  // Edit location modal state
  const [editingLoc, setEditingLoc] = useState(null);

  // New Slot modal state
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    slotNumber: '',
    floor: 'G',
    type: 'FOUR_WHEELER',
    hourlyRate: 50,
  });

  // Edit Slot modal state
  const [editingSlot, setEditingSlot] = useState(null);

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

      if (anRes.data.success) {
        setAnalytics(anRes.data.data);
      }
      if (locRes.data.success) {
        setLocations(locRes.data.data);
        if (locRes.data.data.length > 0 && !selectedLocationId) {
          setSelectedLocationId(locRes.data.data[0]._id);
        }
      }

      if (activeTab === 'SLOTS') {
        const targetId = selectedLocationId || (locRes.data.data[0]?._id);
        if (targetId) {
          const slotRes = await api.get(`/parking/locations/${targetId}/slots`);
          if (slotRes.data.success) {
            setSlots(slotRes.data.data);
          }
        }
      }

      if (activeTab === 'BOOKINGS') {
        await fetchBookings();
      }

      if (activeTab === 'USERS') {
        const uRes = await api.get('/admin/users');
        if (uRes.data.success) {
          setUsersList(uRes.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (bookingFilterStatus !== 'ALL') params.append('status', bookingFilterStatus);
      if (bookingFilterLocation !== 'ALL') params.append('locationId', bookingFilterLocation);
      if (bookingFilterDate) params.append('date', bookingFilterDate);

      const bRes = await api.get(`/admin/bookings?${params.toString()}`);
      if (bRes.data.success) {
        setBookings(bRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch filtered bookings:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'BOOKINGS') {
      fetchBookings();
    }
  }, [bookingFilterStatus, bookingFilterLocation, bookingFilterDate]);

  // Location Handlers
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/locations', {
        name: newLoc.name,
        address: newLoc.address,
        city: newLoc.city,
        tagline: newLoc.tagline,
        pricing: { baseHourly: Number(newLoc.hourlyRate), carHourly: Number(newLoc.hourlyRate) },
        operatingHours: newLoc.operatingHours
      });
      if (res.data.success) {
        alert('Parking facility added successfully!');
        setShowLocModal(false);
        setNewLoc({ name: '', address: '', city: 'Bangalore', tagline: '', hourlyRate: 50, operatingHours: '24/7 Mon-Sun' });
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create location');
    }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    if (!editingLoc) return;
    try {
      const res = await api.put(`/admin/locations/${editingLoc._id}`, {
        name: editingLoc.name,
        address: editingLoc.address,
        city: editingLoc.city,
        tagline: editingLoc.tagline,
        pricing: { baseHourly: Number(editingLoc.hourlyRate), carHourly: Number(editingLoc.hourlyRate) },
        operatingHours: editingLoc.operatingHours
      });
      if (res.data.success) {
        alert('Location updated successfully!');
        setEditingLoc(null);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update location');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Delete this parking facility and all of its bays permanently?')) return;
    try {
      const res = await api.delete(`/admin/locations/${id}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete location');
    }
  };

  // Slot Handlers
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!selectedLocationId) {
      alert('Please select a facility first');
      return;
    }
    try {
      const res = await api.post('/admin/slots', {
        locationId: selectedLocationId,
        slotNumber: newSlot.slotNumber,
        floor: newSlot.floor,
        type: newSlot.type,
        hourlyRate: Number(newSlot.hourlyRate)
      });
      if (res.data.success) {
        alert(`Slot ${newSlot.slotNumber} added successfully!`);
        setShowSlotModal(false);
        setNewSlot({ slotNumber: '', floor: 'G', type: 'FOUR_WHEELER', hourlyRate: 50 });
        const slotRes = await api.get(`/parking/locations/${selectedLocationId}/slots`);
        if (slotRes.data.success) {
          setSlots(slotRes.data.data);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add slot');
    }
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    if (!editingSlot) return;
    try {
      const res = await api.put(`/admin/slots/${editingSlot._id}`, {
        slotNumber: editingSlot.slotNumber,
        floor: editingSlot.floor,
        type: editingSlot.type,
        hourlyRate: Number(editingSlot.hourlyRate),
        status: editingSlot.status
      });
      if (res.data.success) {
        alert('Slot updated successfully!');
        setEditingSlot(null);
        const slotRes = await api.get(`/parking/locations/${selectedLocationId}/slots`);
        if (slotRes.data.success) {
          setSlots(slotRes.data.data);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update slot');
    }
  };

  const handleDeleteSlot = async (slotId, slotNumber) => {
    if (!window.confirm(`Delete bay ${slotNumber}?`)) return;
    try {
      const res = await api.delete(`/admin/slots/${slotId}`);
      if (res.data.success) {
        setSlots(slots.filter(s => s._id !== slotId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete slot');
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

  // Booking Cancel Handler
  const handleCancelBooking = async (bookingId, bookingRef) => {
    const reason = window.prompt(`Are you sure you want to cancel reservation ${bookingRef}? Please enter reason:`, 'Cancelled by Administrator');
    if (reason === null) return;

    try {
      const res = await api.post(`/admin/bookings/${bookingId}/cancel`, { reason });
      if (res.data.success) {
        alert('Booking cancelled and parking slot released back to Available!');
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  // User Management Handlers
  const handleViewUserBookings = async (targetUser) => {
    setUserBookingsLoading(true);
    setSelectedUserBookings({ user: targetUser, bookings: [] });
    try {
      const res = await api.get(`/admin/users/${targetUser._id}/bookings`);
      if (res.data.success) {
        setSelectedUserBookings({ user: targetUser, bookings: res.data.data });
      }
    } catch (err) {
      alert('Failed to load user booking history');
    } finally {
      setUserBookingsLoading(false);
    }
  };

  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role of ${targetUser.name} to "${newRole.toUpperCase()}"?`)) return;

    try {
      const res = await api.put(`/admin/users/${targetUser._id}/role`, { role: newRole });
      if (res.data.success) {
        alert(res.data.message);
        setUsersList(usersList.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold">Admin Console Restricted</h2>
        <p className="text-xs text-slate-400 mt-1">
          You must be logged in as an Administrator (e.g. asjeevaaslm@gmail.com / admin@parkease.com) to access this dashboard.
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
    averageOccupancyRate: 0,
    totalUsers: 0,
    totalLocations: 0,
    activeBookings: 0
  };

  return (
    <div className="relative text-white pb-24">
      
      {/* Top Banner with Glassmorphism */}
      <div className="relative border-b border-white/[0.08] py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5 w-fit">
                <ShieldCheck className="w-3.5 h-3.5" /> Project Owner Administration Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
                ParkEase Commercial Management Center
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
                className="px-4 py-2.5 rounded-xl btn-primary text-xs font-bold flex items-center gap-1.5"
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
                    ? 'bg-indigo-600 text-white border border-indigo-400/50 shadow-indigo-glow'
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
        
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Facilities</span>
            <p className="text-2xl font-black text-white mt-1">{locations.length}</p>
            <span className="text-[10px] text-slate-500">Live Hubs</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Total Bays</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{summary.totalSpaces}</p>
            <span className="text-[10px] text-slate-500">{summary.availableSlots} Available</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Occupied</span>
            <p className="text-2xl font-black text-rose-400 mt-1">{summary.occupiedSlots}</p>
            <span className="text-[10px] text-slate-500">{summary.averageOccupancyRate}% occupancy</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Total Revenue</span>
            <p className="text-2xl font-black text-white mt-1">₹{summary.totalRevenue}</p>
            <span className="text-[10px] text-cyan-400 font-bold">Verified Payments</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Total Bookings</span>
            <p className="text-2xl font-black text-white mt-1">{summary.totalBookings}</p>
            <span className="text-[10px] text-slate-500">{summary.activeBookings || 0} active now</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Registered Users</span>
            <p className="text-2xl font-black text-white mt-1">{summary.totalUsers}</p>
            <span className="text-[10px] text-slate-500">Database Accounts</span>
          </div>
        </div>

        {/* TAB 1: ANALYTICS & CHARTS */}
        {activeTab === 'ANALYTICS' && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Revenue Trend Area Chart */}
              <div className="lg:col-span-8 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Daily Revenue Trend</h3>
                    <p className="text-xs text-slate-400">Total gross earnings across past 7 days</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                    Live Database Metrics
                  </span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.revenueTrend}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#64748b" textAnchor="end" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px' }}
                        formatter={(val) => [`₹${val}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bay Type Distribution Pie */}
              <div className="lg:col-span-4 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Bay Type Breakdown</h3>
                  <p className="text-xs text-slate-400 mb-4">Distribution by equipment and vehicle category</p>
                  
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
                          contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px' }}
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
              <p className="text-xs text-slate-400 mb-6">Current active booking occupancy percentage throughout the day</p>

              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.occupancyByHour}>
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px' }}
                      formatter={(val) => [`${val}%`, 'Occupancy']}
                    />
                    <Bar dataKey="occupancy" fill="#06B6D4" radius={[8, 8, 0, 0]} />
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
              <div>
                <h3 className="text-base font-bold text-white">Managed Facilities ({locations.length})</h3>
                <p className="text-xs text-slate-400">Add, edit, and configure parking facilities</p>
              </div>
              <button
                onClick={() => setShowLocModal(true)}
                className="px-4 py-2 rounded-xl btn-primary text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Add New Facility
              </button>
            </div>

            {locations.length === 0 ? (
              <div className="text-center py-16 p-6">
                <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No Facilities Configured</h4>
                <p className="text-xs text-slate-400 mt-1">Click "Add New Facility" above to create your first smart hub.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.08]">
                {locations.map(loc => (
                  <div key={loc._id} className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{loc.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                          {loc.city || 'Bangalore'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> {loc.address}
                      </p>
                      <p className="text-xs text-slate-500 italic">{loc.tagline}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                        <span>Base Rate: <strong className="text-white">₹{loc.pricing?.baseHourly || loc.pricing?.hourlyRate || 50}/h</strong></span>
                        <span>•</span>
                        <span>Bays: <strong className="text-emerald-400">{loc.availableSlots || 0} available</strong> / {loc.totalSlots || 0}</span>
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
                        className="px-3.5 py-2 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-xs font-bold text-cyan-400 border border-white/10 transition-colors"
                      >
                        Manage Bays
                      </button>
                      <button
                        onClick={() => setEditingLoc({
                          _id: loc._id,
                          name: loc.name,
                          address: loc.address,
                          city: loc.city || 'Bangalore',
                          tagline: loc.tagline || '',
                          hourlyRate: loc.pricing?.baseHourly || loc.pricing?.hourlyRate || 50,
                          operatingHours: loc.operatingHours || '24/7 Mon-Sun'
                        })}
                        className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors"
                        title="Edit facility details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(loc._id)}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Delete facility"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  className="bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  {locations.map(loc => (
                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs text-slate-400 font-medium hidden md:inline">
                  {slots.length} Bays Configured
                </span>
                <button
                  onClick={() => setShowSlotModal(true)}
                  className="px-3.5 py-2 rounded-xl btn-primary text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" /> Add Bay
                </button>
              </div>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-2xl border border-white/10 p-6">
                <p className="text-sm font-bold text-white">No Slots Configured For This Facility</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Bay" above to create individual parking spaces.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {slots.map(slot => (
                  <div key={slot._id} className="p-3.5 glass-panel-subtle rounded-2xl border border-white/10 space-y-2 relative group">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-black text-sm text-white">{slot.slotNumber}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingSlot({
                            _id: slot._id,
                            slotNumber: slot.slotNumber,
                            floor: slot.floor,
                            type: slot.type || 'FOUR_WHEELER',
                            hourlyRate: slot.hourlyRate || 50,
                            status: slot.status || 'available'
                          })}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 transition-opacity p-0.5"
                          title="Edit slot details"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot._id, slot.slotNumber)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5"
                          title="Delete slot"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{slot.type}</span>
                      <span>₹{slot.hourlyRate}/h</span>
                    </div>

                    <select
                      value={slot.status}
                      onChange={(e) => handleUpdateSlotStatus(slot._id, e.target.value)}
                      className={`w-full text-xs font-bold rounded-xl px-2 py-1.5 focus:outline-none ${
                        slot.status === 'available'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : slot.status === 'booked' || slot.status === 'occupied'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : slot.status === 'reserved'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-[#0B0F19] text-slate-400 border border-white/10'
                      }`}
                    >
                      <option value="available">🟢 Available</option>
                      <option value="booked">🔴 Booked</option>
                      <option value="reserved">🟡 Reserved</option>
                      <option value="unavailable">⚫ Inactive / Maintenance</option>
                    </select>

                    <p className="text-[10px] text-slate-500 font-mono truncate">{slot.floor}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ALL RESERVATIONS */}
        {activeTab === 'BOOKINGS' && (
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl space-y-4">
            
            {/* Filter Bar */}
            <div className="p-5 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Platform Reservations ({bookings.length})</h3>
                <p className="text-xs text-slate-400">Filter and manage driver parking sessions</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Filter */}
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="ACTIVE">Active (In Facility)</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                {/* Location Filter */}
                <select
                  value={bookingFilterLocation}
                  onChange={(e) => setBookingFilterLocation(e.target.value)}
                  className="bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold"
                >
                  <option value="ALL">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                  ))}
                </select>

                {/* Date Filter */}
                <input
                  type="date"
                  value={bookingFilterDate}
                  onChange={(e) => setBookingFilterDate(e.target.value)}
                  className="bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />

                {(bookingFilterStatus !== 'ALL' || bookingFilterLocation !== 'ALL' || bookingFilterDate) && (
                  <button
                    onClick={() => {
                      setBookingFilterStatus('ALL');
                      setBookingFilterLocation('ALL');
                      setBookingFilterDate('');
                    }}
                    className="p-2 text-xs text-slate-400 hover:text-white"
                    title="Reset filters"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16 p-6">
                <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No Matching Reservations</h4>
                <p className="text-xs text-slate-400 mt-1">Try adjusting the status or date filters above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0F19]/80 text-slate-400 uppercase font-mono border-b border-white/[0.08]">
                    <tr>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Facility & Bay</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
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
                          <p className="text-[10px] text-cyan-400 font-mono font-bold">Bay {b.slotNumber} ({b.floor})</p>
                        </td>
                        <td className="p-4 font-mono text-white font-semibold">{b.vehicle?.plateNumber || b.vehicleNumber}</td>
                        <td className="p-4 font-mono font-bold text-white">₹{b.totalAmount}</td>
                        <td className="p-4">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {b.paymentStatus || 'PAID'} ({b.paymentMethod || 'UPI'})
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.bookingStatus === 'ACTIVE'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : b.bookingStatus === 'COMPLETED'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : b.bookingStatus === 'CANCELLED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'COMPLETED' ? (
                            <button
                              onClick={() => handleCancelBooking(b._id, b.bookingReference)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-colors"
                              title="Cancel reservation & release slot"
                            >
                              Cancel & Free Bay
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Finalized</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: USER DIRECTORY & ROLE MANAGEMENT */}
        {activeTab === 'USERS' && (
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Registered Accounts ({usersList.length})</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage user profiles, booking histories, and administrator roles</p>
              </div>
            </div>

            {usersList.length === 0 ? (
              <div className="text-center py-16 p-6">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No Registered Accounts Found</h4>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {usersList.map(u => (
                  <div key={u._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3.5">
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4F46E5&color=fff`} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{u.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/[0.06] text-slate-300'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{u.email} • {u.phone || 'No phone'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewUserBookings(u)}
                        className="px-3 py-1.5 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-cyan-300 border border-white/10 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Bookings</span>
                      </button>

                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => handleToggleUserRole(u)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Promote to Admin</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleUserRole(u)}
                          className="px-3 py-1.5 rounded-xl bg-slate-700/40 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          <span>Demote to User</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  placeholder="e.g. Phoenix Mall Smart Deck"
                  value={newLoc.name}
                  onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whitefield Main Road, Bangalore"
                  value={newLoc.address}
                  onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={newLoc.city}
                    onChange={(e) => setNewLoc({ ...newLoc, city: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={newLoc.hourlyRate}
                    onChange={(e) => setNewLoc({ ...newLoc, hourlyRate: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. High-security multi-level parking hub"
                  value={newLoc.tagline}
                  onChange={(e) => setNewLoc({ ...newLoc, tagline: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLocModal(false)}
                  className="px-4 py-2.5 rounded-xl glass-panel-subtle text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-primary font-bold shadow-indigo-glow"
                >
                  Create Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {editingLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="glass-panel rounded-3xl border border-white/15 w-full max-w-lg p-6 sm:p-7 shadow-2xl text-white">
            <div className="flex justify-between items-center pb-3.5 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white">Edit Parking Facility</h3>
              <button onClick={() => setEditingLoc(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateLocation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={editingLoc.name}
                  onChange={(e) => setEditingLoc({ ...editingLoc, name: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  value={editingLoc.address}
                  onChange={(e) => setEditingLoc({ ...editingLoc, address: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={editingLoc.city}
                    onChange={(e) => setEditingLoc({ ...editingLoc, city: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Base Rate (₹/hr)</label>
                  <input
                    type="number"
                    value={editingLoc.hourlyRate}
                    onChange={(e) => setEditingLoc({ ...editingLoc, hourlyRate: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={editingLoc.tagline}
                  onChange={(e) => setEditingLoc({ ...editingLoc, tagline: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingLoc(null)}
                  className="px-4 py-2.5 rounded-xl glass-panel-subtle text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-primary font-bold shadow-indigo-glow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="glass-panel rounded-3xl border border-white/15 w-full max-w-md p-6 shadow-2xl text-white">
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white">Add Parking Bay</h3>
              <button onClick={() => setShowSlotModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Slot Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A-101, B2-05"
                  value={newSlot.slotNumber}
                  onChange={(e) => setNewSlot({ ...newSlot, slotNumber: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Floor Level</label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor (G), Basement 1 (B1)"
                  value={newSlot.floor}
                  onChange={(e) => setNewSlot({ ...newSlot, floor: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={newSlot.type}
                    onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FOUR_WHEELER">Four Wheeler (Car)</option>
                    <option value="TWO_WHEELER">Two Wheeler (Bike)</option>
                    <option value="EV">Electric Vehicle (EV)</option>
                    <option value="HEAVY">Heavy Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={newSlot.hourlyRate}
                    onChange={(e) => setNewSlot({ ...newSlot, hourlyRate: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
                  className="px-4 py-2.5 rounded-xl glass-panel-subtle text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-primary font-bold shadow-indigo-glow"
                >
                  Add Bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="glass-panel rounded-3xl border border-white/15 w-full max-w-md p-6 shadow-2xl text-white">
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white">Edit Parking Bay {editingSlot.slotNumber}</h3>
              <button onClick={() => setEditingSlot(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateSlot} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Slot Identifier</label>
                <input
                  type="text"
                  required
                  value={editingSlot.slotNumber}
                  onChange={(e) => setEditingSlot({ ...editingSlot, slotNumber: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Floor Level</label>
                <input
                  type="text"
                  value={editingSlot.floor}
                  onChange={(e) => setEditingSlot({ ...editingSlot, floor: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={editingSlot.type}
                    onChange={(e) => setEditingSlot({ ...editingSlot, type: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FOUR_WHEELER">Four Wheeler (Car)</option>
                    <option value="TWO_WHEELER">Two Wheeler (Bike)</option>
                    <option value="EV">Electric Vehicle (EV)</option>
                    <option value="HEAVY">Heavy Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={editingSlot.hourlyRate}
                    onChange={(e) => setEditingSlot({ ...editingSlot, hourlyRate: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Availability Status</label>
                <select
                  value={editingSlot.status}
                  onChange={(e) => setEditingSlot({ ...editingSlot, status: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="available">🟢 Available</option>
                  <option value="booked">🔴 Booked</option>
                  <option value="reserved">🟡 Reserved</option>
                  <option value="unavailable">⚫ Inactive / Maintenance</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2.5 rounded-xl glass-panel-subtle text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-primary font-bold shadow-indigo-glow"
                >
                  Save Bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Bookings History Modal */}
      {selectedUserBookings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="glass-panel rounded-3xl border border-white/15 w-full max-w-2xl p-6 shadow-2xl text-white max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.08] mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Booking History: {selectedUserBookings.user.name}</h3>
                <p className="text-xs text-slate-400">{selectedUserBookings.user.email}</p>
              </div>
              <button onClick={() => setSelectedUserBookings(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {userBookingsLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : selectedUserBookings.bookings.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  This user has not placed any reservations yet.
                </div>
              ) : (
                selectedUserBookings.bookings.map(b => (
                  <div key={b._id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-white">{b.bookingReference}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.bookingStatus === 'COMPLETED' ? 'bg-indigo-500/20 text-indigo-300' :
                          b.bookingStatus === 'ACTIVE' ? 'bg-cyan-500/20 text-cyan-300' :
                          b.bookingStatus === 'CANCELLED' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium">{b.locationName} • Bay {b.slotNumber} ({b.floor})</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
                      <p className="text-sm font-black font-mono text-white">₹{b.totalAmount}</p>
                      <span className="text-[10px] text-slate-400">{b.paymentMethod || 'UPI'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 mt-4 flex justify-end">
              <button
                onClick={() => setSelectedUserBookings(null)}
                className="px-4 py-2 rounded-xl glass-panel-subtle text-xs font-bold text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Change Password Modal if Admin is on temporary password */}
      <ForceChangePasswordModal
        isOpen={Boolean(user?.mustChangePassword)}
        onSuccess={() => window.location.reload()}
      />

    </div>
  );
}

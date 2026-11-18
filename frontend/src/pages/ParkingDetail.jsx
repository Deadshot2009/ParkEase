import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  SquareParking, 
  MapPin, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Car, 
  Calendar, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Share2
} from 'lucide-react';
import api from '../services/api';
import { socket, joinLocationRoom, leaveLocationRoom } from '../services/socket';
import { useAuth } from '../context/AuthContext';

export default function ParkingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [location, setLocation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activeFloor, setActiveFloor] = useState('Ground Floor (G)');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Duration & Booking Form state
  const [durationHours, setDurationHours] = useState(2);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [customPlate, setCustomPlate] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('14:00');

  useEffect(() => {
    fetchLocationDetails();
    fetchSlots();

    // Socket.io room join and real-time updates listener
    joinLocationRoom(id);

    const handleSlotUpdate = (data) => {
      if (data.locationId === id) {
        setSlots((prevSlots) =>
          prevSlots.map((s) =>
            s._id === data.slotId || s.slotNumber === data.slotNumber
              ? { ...s, status: data.status }
              : s
          )
        );

        // If currently selected slot was just booked by someone else
        setSelectedSlot((current) => {
          if (current && (current._id === data.slotId || current.slotNumber === data.slotNumber)) {
            if (data.status === 'booked' || data.status === 'unavailable') {
              alert(`Slot ${data.slotNumber} was just reserved by another user. Please choose another bay.`);
              return null;
            }
          }
          return current;
        });
      }
    };

    socket.on('slot_updated', handleSlotUpdate);

    return () => {
      leaveLocationRoom(id);
      socket.off('slot_updated', handleSlotUpdate);
    };
  }, [id, activeFloor]);

  // Set default vehicle when user loads
  useEffect(() => {
    if (user?.vehicles?.length > 0 && !selectedVehicle) {
      setSelectedVehicle(user.vehicles[0]);
    }
  }, [user]);

  const fetchLocationDetails = async () => {
    try {
      const res = await api.get(`/parking/locations/${id}`);
      if (res.data.success) {
        setLocation(res.data.data);
        if (res.data.data.floors?.length > 0) {
          setActiveFloor(res.data.data.floors[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch location details:', err);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/parking/locations/${id}/slots`);
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: location.name,
          text: `Reserve guaranteed parking bay at ${location.name} on ParkEase:`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Filter slots for current floor
  const floorSlots = slots.filter((s) => s.floor === activeFloor);

  // Status badge styling helper (Consistent colors: GREEN = Available, RED = Booked, YELLOW = Reserved, GREY = Unavailable)
  const getSlotColor = (slot) => {
    const isSelected = selectedSlot?._id === slot._id;
    if (isSelected) {
      return 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold border-2 border-white ring-4 ring-indigo-500/50 scale-[1.03] z-10 shadow-indigo-glow';
    }

    const st = (slot.status || '').toLowerCase();
    switch (st) {
      case 'available':
        return 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-900/50 cursor-pointer shadow-sm';
      case 'booked':
      case 'occupied':
        return 'bg-rose-950/40 text-rose-400 border border-rose-500/50 cursor-not-allowed opacity-80';
      case 'reserved':
        return 'bg-amber-950/40 text-amber-300 border border-amber-500/50 cursor-not-allowed opacity-85';
      case 'unavailable':
      case 'maintenance':
      default:
        return 'bg-slate-800/40 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60';
    }
  };

  // Price calculations
  const ratePerHour = selectedSlot?.hourlyRate || location?.pricing?.hourlyRate || 40;
  const subtotal = Math.round(ratePerHour * durationHours);
  const taxes = Math.round(subtotal * 0.18 * 100) / 100;
  const totalAmount = Math.round(subtotal + taxes);

  // Handle proceed to confirmation
  const handleProceedToBooking = () => {
    if (!selectedSlot) {
      alert('Please select an available parking bay first.');
      return;
    }

    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const vehicleInfo = selectedVehicle || {
      plateNumber: customPlate.toUpperCase().trim() || 'KA-01-AB-1234',
      makeModel: 'Standard Passenger Vehicle',
      type: selectedSlot.type === 'EV' ? 'EV' : 'Car'
    };

    // Construct start and end dates
    const startDateTime = new Date(`${bookingDate}T${bookingTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 3600000);

    // Save intent into session storage and proceed to checkout
    const bookingDraft = {
      locationId: location._id,
      locationName: location.name,
      locationAddress: location.address,
      slotId: selectedSlot._id,
      slotNumber: selectedSlot.slotNumber,
      floor: activeFloor,
      slotType: selectedSlot.type,
      hourlyRate: ratePerHour,
      durationHours,
      subtotal,
      taxes,
      totalAmount,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      vehicle: vehicleInfo
    };

    sessionStorage.setItem('parkease_draft_booking', JSON.stringify(bookingDraft));
    navigate('/booking/confirm');
  };

  if (!location) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative text-white pb-24">
      {/* Location Top Bar Header with Glassmorphism */}
      <div className="relative border-b border-white/[0.08] py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors mb-4 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Locations
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-indigo-500/20 text-cyan-400 border border-indigo-500/30">
                  {location.operatingHours}
                </span>
                <span className="text-xs text-slate-400">★ {location.rating} ({location.reviewCount} reviews)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{location.name}</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{location.address}</span>
              </p>
            </div>

            {/* Quick stats pill & Share */}
            <div className="flex items-center gap-3">
              <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Standard Bay</span>
                  <p className="text-lg font-black text-white">₹{location.pricing?.hourlyRate || 40}<span className="text-xs font-normal text-slate-400">/hr</span></p>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Open Bays</span>
                  <p className="text-lg font-black text-cyan-400">{location.availableSlots || 0}</p>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="p-3 rounded-2xl glass-panel-subtle hover:bg-white/[0.08] text-slate-300 hover:text-cyan-300 border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Share this parking facility"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2 Cols): Floor Switcher & Interactive Grid */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Floor Navigation Tabs */}
            <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 overflow-x-auto border border-white/10 shadow-lg">
              {location.floors?.map((floorName) => (
                <button
                  key={floorName}
                  onClick={() => {
                    setActiveFloor(floorName);
                    setSelectedSlot(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeFloor === floorName
                      ? 'bg-indigo-600 text-white shadow-indigo-glow border border-indigo-400/50'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {floorName}
                </button>
              ))}
            </div>

            {/* Legend Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-400"></span>
                <span className="text-emerald-300 font-semibold">GREEN – Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-400"></span>
                <span className="text-rose-300 font-semibold">RED – Booked / Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-400"></span>
                <span className="text-amber-300 font-semibold">YELLOW – Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-600 border border-slate-500"></span>
                <span className="text-slate-400 font-semibold">GREY – Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-indigo-600 border border-white ring-1 ring-indigo-400"></span>
                <span className="text-white font-semibold">Selected Bay</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span>EV Bay</span>
              </div>
            </div>

            {/* Interactive Floor Bay Grid Canvas */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative shadow-2xl">
              
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {activeFloor} Layout
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Click any open cyan slot to lock reservation</p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {floorSlots.filter((s) => s.status === 'available').length} Available / {floorSlots.length} Total
                </div>
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : floorSlots.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  No parking slots configured for {activeFloor}.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {floorSlots.map((slot) => {
                    const isSelected = selectedSlot?._id === slot._id;
                    const isAvailable = slot.status === 'available';

                    return (
                      <button
                        key={slot._id}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between transition-all duration-200 text-left relative overflow-hidden group min-h-[95px] ${getSlotColor(
                          slot
                        )}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm sm:text-base font-black font-mono tracking-tight">
                            {slot.slotNumber}
                          </span>
                          {slot.type === 'EV' && (
                            <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-cyan-400 animate-pulse'}`} />
                          )}
                          {slot.type === 'VIP' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                              VIP
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-end justify-between">
                          <span className="text-[10px] uppercase font-semibold tracking-wider opacity-80">
                            {isSelected ? 'SELECTED' : slot.status}
                          </span>
                          <span className="text-xs font-bold">
                            ₹{slot.hourlyRate}/h
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Driving Lane Indicator Visual */}
              <div className="mt-8 pt-4 border-t border-dashed border-white/10 flex items-center justify-center text-[10px] text-slate-500 tracking-widest uppercase font-mono">
                ◄ ONE-WAY AUTOMATED SENSOR DRIVEWAY ►
              </div>
            </div>

            {/* Location Amenities Info Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Facility Amenities</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {location.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (1 Col): Reservation Drawer & Checkout Summary */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6 sticky top-24">
            
            <div className="pb-4 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>Reserve Bay</span>
                {selectedSlot ? (
                  <span className="text-xs font-black font-mono text-cyan-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/40">
                    Bay {selectedSlot.slotNumber}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-normal">Choose a slot</span>
                )}
              </h3>
            </div>

            {/* Selected Slot Information Banner */}
            {selectedSlot ? (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Bay Type</span>
                  <span className="font-bold text-cyan-300">{selectedSlot.type} Bay</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Location Floor</span>
                  <span className="font-bold text-white">{selectedSlot.floor}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Hourly Rate</span>
                  <span className="font-mono font-bold text-white">₹{ratePerHour} / hour</span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-slate-400 text-xs">
                Select an open (cyan) bay from the floor grid to configure your booking.
              </div>
            )}

            {/* Date & Time Picker */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Arrival Schedule</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 uppercase tracking-wider">Duration</span>
                <span className="text-cyan-400 font-mono text-sm">{durationHours} Hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 hr</span>
                <span>4 hrs</span>
                <span>8 hrs</span>
                <span>12 hrs</span>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Vehicle License Plate</label>
              {user?.vehicles?.length > 0 ? (
                <select
                  value={selectedVehicle?.plateNumber || ''}
                  onChange={(e) => {
                    const found = user.vehicles.find((v) => v.plateNumber === e.target.value);
                    setSelectedVehicle(found);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60 font-mono"
                >
                  {user.vehicles.map((v) => (
                    <option key={v.plateNumber} value={v.plateNumber}>
                      {v.plateNumber} ({v.makeModel})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. MH-02-CP-8899"
                  value={customPlate}
                  onChange={(e) => setCustomPlate(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60 font-mono uppercase"
                />
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Parking Fee ({durationHours} hrs × ₹{ratePerHour})</span>
                <span className="font-mono text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18%)</span>
                <span className="font-mono text-white">₹{taxes}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/5">
                <span>Total Payable</span>
                <span className="text-cyan-400 font-mono text-base">₹{totalAmount}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedToBooking}
              disabled={!selectedSlot}
              className="w-full py-3.5 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>Proceed to Secure Payment</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <p className="text-[10px] text-center text-slate-500">
              Instant lock • Automated QR pass issued upon UPI confirmation
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

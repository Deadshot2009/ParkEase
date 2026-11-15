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

  // Filter slots for current floor
  const floorSlots = slots.filter((s) => s.floor === activeFloor);

  // Status badge styling helper
  const getSlotColor = (slot) => {
    const isSelected = selectedSlot?._id === slot._id;
    if (isSelected) {
      return 'bg-gradient-to-tr from-[#00E676] to-emerald-400 text-[#040711] font-bold border-2 border-white ring-4 ring-emerald-500/40 scale-[1.03] z-10 shadow-emerald-glow';
    }

    switch (slot.status) {
      case 'available':
        return 'glass-panel text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/40 cursor-pointer shadow-card-subtle';
      case 'booked':
        return 'bg-rose-950/20 text-rose-400 border-rose-500/30 cursor-not-allowed opacity-75';
      case 'reserved':
        return 'bg-amber-950/25 text-amber-300 border-amber-500/35 cursor-not-allowed opacity-80';
      case 'unavailable':
      default:
        return 'bg-white/[0.02] text-slate-500 border-white/5 cursor-not-allowed opacity-50';
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
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative text-white pb-24">
      {/* Location Top Bar Header with Glassmorphism */}
      <div className="relative border-b border-white/[0.08] py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-emerald-400 mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to all hubs
              </button>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{location.name}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {location.address}
              </p>
            </div>

            {/* Quick stats pill */}
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl glass-panel-subtle text-xs font-semibold text-slate-300 border border-white/10">
                Hours: <span className="text-white font-bold">{location.operatingHours}</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-xs font-bold text-emerald-400 border border-emerald-500/30 shadow-emerald-glow">
                ★ {location.rating} ({location.reviewCount} verified reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Visual Parking Floor Layout (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Floor Tabs & Color Legend */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Floor Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {location.floors?.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => {
                      setActiveFloor(fl);
                      setSelectedSlot(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeFloor === fl
                        ? 'btn-emerald text-[#040711]'
                        : 'glass-panel-subtle text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>

              {/* Status Color Legend */}
              <div className="flex items-center gap-3.5 text-[11px] font-semibold text-slate-300 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] shadow-[0_0_8px_#00E676]"></span> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span> Booked
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span> Reserved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> Maintenance
                </span>
              </div>
            </div>

            {/* Interactive Parking Map Bay Canvas */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-parking-stripes">
              
              {/* Driveway Lane Marking */}
              <div className="flex items-center justify-between mb-5 px-3 text-xs text-slate-400 border-b border-white/[0.08] pb-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                  ▲ VEHICLE ENTRY GATE
                </span>
                <span className="text-[11px] uppercase tracking-widest font-mono text-slate-500">
                  Driveway Center Lane (One-Way)
                </span>
                <span className="flex items-center gap-1.5 text-rose-400 font-mono font-bold">
                  EXIT GATE ▼
                </span>
              </div>

              {/* Slot Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3 sm:gap-4 my-6">
                {floorSlots.map((slot) => {
                  const isAvailable = slot.status === 'available';
                  const isSelected = selectedSlot?._id === slot._id;

                  return (
                    <button
                      key={slot._id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 text-left h-24 sm:h-28 ${getSlotColor(slot)}`}
                    >
                      {/* Top row: Slot number & Type badge */}
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono font-black text-sm sm:text-base tracking-wider">
                          {slot.slotNumber}
                        </span>
                        
                        {slot.type === 'EV' && (
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                            isSelected ? 'bg-[#040711] text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            <Zap className="w-3 h-3 fill-current" /> EV
                          </span>
                        )}

                        {slot.type === 'VIP' && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            👑 VIP
                          </span>
                        )}

                        {slot.type === 'Accessible' && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            ♿ Acc.
                          </span>
                        )}
                      </div>

                      {/* Middle: Vehicle or Status */}
                      <div className="text-[11px] font-medium truncate">
                        {slot.status === 'booked' ? (
                          <span className="font-mono text-[10px] text-rose-400 font-bold">
                            {slot.currentVehicle || 'OCCUPIED'}
                          </span>
                        ) : slot.status === 'reserved' ? (
                          <span className="text-[10px] text-amber-400 font-bold">HOLD</span>
                        ) : slot.status === 'unavailable' ? (
                          <span className="text-[10px] text-slate-500 font-bold">CLOSED</span>
                        ) : (
                          <span className={isSelected ? 'text-[#040711] font-bold' : 'text-emerald-400 font-bold'}>
                            Available
                          </span>
                        )}
                      </div>

                      {/* Bottom rate */}
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-current/15 font-semibold">
                        <span>₹{slot.hourlyRate}/h</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 fill-current" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Driveway Bottom Lane */}
              <div className="text-center py-2.5 bg-[#040711]/60 rounded-xl border border-dashed border-white/10 text-xs font-mono text-slate-400">
                ===== REVERSE / DRIVE-IN LANE =====
              </div>
            </div>

            {/* Location Amenities & Specs */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Facility Infrastructure & Services</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {location.amenities?.map((amenity, idx) => (
                  <div key={idx} className="p-3 bg-[#040711]/50 rounded-xl border border-white/5 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-200 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar: Booking Calculator & Reservation Drawer (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 glass-panel border border-white/10 rounded-3xl p-6 shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <SquareParking className="w-5 h-5 text-emerald-400" />
                  <span>Bay Reservation</span>
                </h3>
                {selectedSlot ? (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold btn-emerald text-[#040711]">
                    Bay {selectedSlot.slotNumber}
                  </span>
                ) : (
                  <span className="text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-medium">
                    Select a Slot
                  </span>
                )}
              </div>

              {selectedSlot ? (
                <div className="space-y-5 mt-5">
                  {/* Selected Bay Specs */}
                  <div className="p-4 bg-[#040711]/70 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Selected Bay:</span>
                      <span className="font-bold text-white">{selectedSlot.slotNumber} ({selectedSlot.type})</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Floor:</span>
                      <span className="text-slate-200 font-medium">{activeFloor}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Base Hourly Rate:</span>
                      <span className="text-emerald-400 font-bold">₹{ratePerHour} / hour</span>
                    </div>
                  </div>

                  {/* Date & Start Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">Booking Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-[#040711]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">Entry Time</label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-[#040711]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Duration Selector */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-300">Duration</span>
                      <span className="text-emerald-400 font-bold">{durationHours} Hours</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                      {[1, 2, 4, 8].map((hrs) => (
                        <button
                          key={hrs}
                          onClick={() => setDurationHours(hrs)}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                            durationHours === hrs
                              ? 'btn-emerald text-[#040711]'
                              : 'glass-panel-subtle text-slate-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {hrs} hr{hrs > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="24"
                      value={durationHours}
                      onChange={(e) => setDurationHours(parseInt(e.target.value))}
                      className="w-full accent-[#00E676]"
                    />
                  </div>

                  {/* Vehicle selection */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">Vehicle Details</label>
                    {user?.vehicles?.length > 0 ? (
                      <select
                        onChange={(e) => {
                          const veh = user.vehicles.find(v => v.id === e.target.value);
                          setSelectedVehicle(veh);
                        }}
                        className="w-full bg-[#040711]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {user.vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.plateNumber} ({v.makeModel})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter Number Plate (e.g. DL-01-AB-1234)"
                        value={customPlate}
                        onChange={(e) => setCustomPlate(e.target.value)}
                        className="w-full bg-[#040711]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-emerald-500"
                      />
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="pt-4 border-t border-white/[0.08] space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Rate (₹{ratePerHour} × {durationHours} hrs)</span>
                      <span className="text-white font-medium">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>GST (18%)</span>
                      <span className="text-white font-medium">₹{taxes}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/[0.08]">
                      <span>Total Payable</span>
                      <span className="text-emerald-400 text-lg font-mono">₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Proceed to checkout CTA */}
                  <button
                    onClick={handleProceedToBooking}
                    className="w-full py-3.5 rounded-xl btn-emerald text-sm font-black flex items-center justify-center gap-2"
                  >
                    <span>Confirm & Pay ₹{totalAmount}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <p className="text-[10px] text-slate-400 text-center">
                    Instant cancellation allowed up to 15 mins before entry window.
                  </p>
                </div>
              ) : (
                <div className="text-center py-14">
                  <div className="w-14 h-14 rounded-2xl glass-panel-subtle text-emerald-400 flex items-center justify-center mx-auto mb-3.5 border border-white/10">
                    <SquareParking className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Click any Green Bay on the map</h4>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Select your preferred parking bay on the floor plan to view pricing, customize duration, and lock your spot.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

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
      return 'bg-emerald-500 text-[#0A1128] border-2 border-white ring-4 ring-emerald-500/30 scale-105 z-10';
    }

    switch (slot.status) {
      case 'available':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-900/50 cursor-pointer';
      case 'booked':
        return 'bg-rose-950/40 text-rose-400 border-rose-600/40 cursor-not-allowed opacity-80';
      case 'reserved':
        return 'bg-amber-950/40 text-amber-300 border-amber-500/40 cursor-not-allowed opacity-85';
      case 'unavailable':
      default:
        return 'bg-gray-800/60 text-gray-400 border-gray-700 cursor-not-allowed opacity-60';
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
      <div className="min-h-screen bg-[#0A1128] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1128] text-white pb-24">
      {/* Location Top Bar Header */}
      <div className="bg-[#0C152E] border-b border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-emerald-400 mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to all hubs
              </button>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{location.name}</h1>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {location.address}
              </p>
            </div>

            {/* Quick stats pill */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 border border-gray-700">
                Operating: <span className="text-white">{location.operatingHours}</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
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
            <div className="bg-[#0D1630] p-4 rounded-2xl border border-gray-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Floor Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {location.floors?.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => {
                      setActiveFloor(fl);
                      setSelectedSlot(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeFloor === fl
                        ? 'bg-[#00C853] text-[#0A1128] shadow-md shadow-emerald-500/20'
                        : 'bg-gray-800/80 text-gray-400 hover:text-white'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>

              {/* Status Color Legend */}
              <div className="flex items-center gap-3 text-[11px] font-medium text-gray-300 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00C853]"></span> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Booked
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Reserved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-600"></span> Maintenance
                </span>
              </div>
            </div>

            {/* Interactive Parking Map Bay Canvas */}
            <div className="bg-[#0B132B] p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden">
              
              {/* Driveway Lane Marking */}
              <div className="flex items-center justify-between mb-4 px-2 text-xs text-gray-400 border-b border-gray-800/80 pb-2">
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  ▲ VEHICLE ENTRY GATE
                </span>
                <span className="text-[11px] uppercase tracking-widest font-mono text-gray-500">
                  Driveway Center Lane (One-Way)
                </span>
                <span className="flex items-center gap-1 text-rose-400 font-mono">
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
                      className={`relative p-3.5 sm:p-4 rounded-xl border flex flex-col justify-between transition-all duration-200 text-left h-24 sm:h-28 ${getSlotColor(slot)}`}
                    >
                      {/* Top row: Slot number & Type badge */}
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono font-black text-sm sm:text-base tracking-wider">
                          {slot.slotNumber}
                        </span>
                        
                        {slot.type === 'EV' && (
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                            isSelected ? 'bg-[#0A1128] text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'
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
                          <span className="font-mono text-[10px] text-rose-400">
                            {slot.currentVehicle || 'OCCUPIED'}
                          </span>
                        ) : slot.status === 'reserved' ? (
                          <span className="text-[10px] text-amber-400">HOLD</span>
                        ) : slot.status === 'unavailable' ? (
                          <span className="text-[10px] text-gray-500">CLOSED</span>
                        ) : (
                          <span className={isSelected ? 'text-[#0A1128] font-bold' : 'text-emerald-400'}>
                            Available
                          </span>
                        )}
                      </div>

                      {/* Bottom rate */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-current/20">
                        <span>₹{slot.hourlyRate}/h</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 fill-current" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Driveway Bottom Lane */}
              <div className="text-center py-2 bg-gray-900/60 rounded-xl border border-dashed border-gray-700/60 text-xs font-mono text-gray-400">
                ===== REVERSE / DRIVE-IN LANE =====
              </div>
            </div>

            {/* Location Amenities & Specs */}
            <div className="bg-[#0D1630] p-6 rounded-2xl border border-gray-800 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Facility Infrastructure & Services</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {location.amenities?.map((amenity, idx) => (
                  <div key={idx} className="p-3 bg-gray-900/70 rounded-xl border border-gray-800/80 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-gray-200">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar: Booking Calculator & Reservation Drawer (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-[#0D1630] border border-gray-800 rounded-2xl p-6 shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <SquareParking className="w-5 h-5 text-emerald-400" />
                  <span>Bay Reservation</span>
                </h3>
                {selectedSlot ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#00C853] text-[#0A1128]">
                    Bay {selectedSlot.slotNumber}
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    Select a Slot
                  </span>
                )}
              </div>

              {selectedSlot ? (
                <div className="space-y-5 mt-5">
                  {/* Selected Bay Specs */}
                  <div className="p-3.5 bg-gray-900 rounded-xl border border-gray-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Selected Bay:</span>
                      <span className="font-bold text-white">{selectedSlot.slotNumber} ({selectedSlot.type})</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1.5">
                      <span className="text-gray-400">Floor:</span>
                      <span className="text-gray-200">{activeFloor}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1.5">
                      <span className="text-gray-400">Base Hourly Rate:</span>
                      <span className="text-emerald-400 font-bold">₹{ratePerHour} / hour</span>
                    </div>
                  </div>

                  {/* Date & Start Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-gray-400 font-semibold mb-1">Booking Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 font-semibold mb-1">Entry Time</label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Duration Selector */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-gray-300">Duration</span>
                      <span className="text-emerald-400 font-bold">{durationHours} Hours</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      {[1, 2, 4, 8].map((hrs) => (
                        <button
                          key={hrs}
                          onClick={() => setDurationHours(hrs)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            durationHours === hrs
                              ? 'bg-[#00C853] text-[#0A1128] border-[#00C853]'
                              : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-600'
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
                      className="w-full accent-[#00C853]"
                    />
                  </div>

                  {/* Vehicle selection */}
                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">Vehicle Details</label>
                    {user?.vehicles?.length > 0 ? (
                      <select
                        onChange={(e) => {
                          const veh = user.vehicles.find(v => v.id === e.target.value);
                          setSelectedVehicle(veh);
                        }}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-emerald-500"
                      />
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="pt-4 border-t border-gray-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Rate (₹{ratePerHour} × {durationHours} hrs)</span>
                      <span className="text-white">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>GST (18%)</span>
                      <span className="text-white">₹{taxes}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-gray-800">
                      <span>Total Payable</span>
                      <span className="text-emerald-400 text-lg">₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Proceed to checkout CTA */}
                  <button
                    onClick={handleProceedToBooking}
                    className="w-full py-3.5 rounded-xl bg-[#00C853] hover:bg-[#00b54b] text-[#0A1128] font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <span>Confirm & Pay ₹{totalAmount}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <p className="text-[10px] text-gray-400 text-center">
                    Instant cancellation allowed up to 15 mins before entry window.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-gray-800/80 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <SquareParking className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Click any Green Bay on the map</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Select your preferred parking slot on the floor layout to view pricing and lock your reservation.
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

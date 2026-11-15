import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  SquareParking, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Download, 
  Share2, 
  Car, 
  ShieldCheck, 
  ArrowLeft,
  Navigation,
  QrCode as QrIcon
} from 'lucide-react';
import api from '../services/api';

export default function QRTicket() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        if (res.data.success) {
          setBooking(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch ticket:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold">Booking Pass Not Found</h2>
        <Link to="/dashboard" className="mt-4 px-4 py-2 btn-emerald rounded-xl text-xs font-bold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const qrString = booking.qrCodeData || JSON.stringify({
    bookingRef: booking.bookingReference,
    slotNumber: booking.slotNumber,
    locationId: booking.locationId
  });

  return (
    <div className="relative text-white py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-md mx-auto relative z-10">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/history"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> My Reservations
          </Link>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" /> Verified & Active
          </span>
        </div>

        {/* Digital Boarding Pass Ticket Card with Glassmorphism */}
        <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative print:border-black print:text-black">
          
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-[#00E676] to-teal-400 p-6 text-[#040711]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SquareParking className="w-6 h-6 stroke-[2.5]" />
                <span className="font-black text-lg tracking-tight">ParkEase Pass</span>
              </div>
              <span className="font-mono text-xs font-bold uppercase bg-[#040711] text-emerald-400 px-3 py-1 rounded-full shadow-md">
                {booking.bookingReference}
              </span>
            </div>

            <div className="mt-6 text-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#040711]/75 block">
                Reserved Parking Bay
              </span>
              <span className="text-5xl font-black font-mono tracking-tight text-[#040711] drop-shadow-sm">
                {booking.slotNumber}
              </span>
              <span className="text-xs font-bold block text-[#040711]/90 mt-1">
                {booking.floor} • {booking.slotType} Bay
              </span>
            </div>
          </div>

          {/* Ticket Perforation Notch effect */}
          <div className="relative flex items-center justify-between bg-transparent px-2 py-1">
            <div className="w-5 h-8 bg-[#040711] rounded-r-full -ml-4 border-r border-white/10"></div>
            <div className="flex-1 border-b-2 border-dashed border-white/15 mx-2"></div>
            <div className="w-5 h-8 bg-[#040711] rounded-l-full -mr-4 border-l border-white/10"></div>
          </div>

          {/* QR Code Container */}
          <div className="p-6 text-center">
            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-2xl mx-auto border-4 border-emerald-500/20">
              <img
                src={booking.qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`}
                alt="Gate Pass QR"
                className="w-48 h-48 object-contain rounded-lg"
              />
            </div>
            
            <p className="text-xs font-semibold text-emerald-400 mt-4 flex items-center justify-center gap-1.5">
              <QrIcon className="w-4 h-4" />
              <span>Scan this QR at the entrance boom barrier</span>
            </p>
          </div>

          {/* Details Section */}
          <div className="p-6 pt-0 space-y-3.5 text-xs">
            <div className="p-4 bg-[#040711]/70 rounded-2xl border border-white/10 space-y-2.5">
              <div className="flex justify-between items-start">
                <span className="text-slate-400">Location:</span>
                <span className="font-bold text-white text-right max-w-[200px]">{booking.locationName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Vehicle:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {booking.vehicle?.plateNumber}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Valid Window:</span>
                <span className="text-slate-200 font-medium">
                  {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-white/[0.08]">
                <span className="text-slate-400">Payment:</span>
                <span className="text-emerald-400 font-bold font-mono">
                  PAID ₹{booking.totalAmount} ({booking.paymentMethod})
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-xs font-bold text-white border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Pass</span>
              </button>

              <button
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-xs font-bold text-white border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Link Copied!' : 'Share Pass'}</span>
              </button>
            </div>

            {/* Gate scanner simulator link */}
            <Link
              to={`/gate-scanner?ref=${booking.bookingReference}`}
              className="w-full py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center justify-center gap-2 transition-all mt-3"
            >
              <QrIcon className="w-4 h-4" />
              <span>Simulate Gate Barrier Scan</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

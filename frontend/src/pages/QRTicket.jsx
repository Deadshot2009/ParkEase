import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  SquareParking, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  Download, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  Zap,
  Info
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
        setLoading(true);
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

  const handleShare = async () => {
    try {
      if (navigator.share && booking) {
        await navigator.share({
          title: `ParkEase Pass - Slot ${booking.slotNumber}`,
          text: `My verified parking pass for ${booking.locationName} (Slot: ${booking.slotNumber}, Ref: ${booking.bookingReference})`,
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

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-bold">Booking Pass Not Found</h2>
        <Link to="/dashboard" className="mt-4 px-4 py-2 rounded-xl btn-primary text-xs font-bold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const qrImageUrl = booking.qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(booking.bookingReference)}`;

  return (
    <div className="relative text-white py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-md mx-auto">
        
        {/* Navigation back & Share */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/history"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> My Bookings
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 px-2.5 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-xs font-bold text-slate-300 hover:text-cyan-300 border border-white/10 transition-colors flex items-center gap-1"
              title="Share gate pass"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copied ? 'Copied Link!' : 'Share'}</span>
            </button>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              {booking.bookingStatus} PASS
            </span>
          </div>
        </div>

        {/* Boarding Pass Styled Ticket Card */}
        <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
          
          {/* Top Notch Brand Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <SquareParking className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black tracking-tight">ParkEase</span>
              </div>
              <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-full">
                GATE PASS
              </span>
            </div>

            <div className="mt-6 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Designated Slot</span>
                <p className="text-3xl font-black font-mono tracking-tight text-white mt-0.5">
                  {booking.slotNumber}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Floor Level</span>
                <p className="text-sm font-bold text-white mt-0.5">{booking.floor}</p>
              </div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">{booking.locationName}</h3>
              <p className="text-xs text-slate-400 flex items-center mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-400 shrink-0" />
                <span>{booking.locationAddress}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Vehicle Plate</span>
                <p className="font-mono font-black text-cyan-300 mt-0.5">{booking.vehicle?.plateNumber}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Reference Code</span>
                <p className="font-mono font-bold text-white mt-0.5">{booking.bookingReference}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Valid From</span>
                <p className="font-mono text-white mt-0.5">
                  {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Valid Until</span>
                <p className="font-mono text-white mt-0.5">
                  {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Perforation Divider Line */}
            <div className="relative py-2">
              <div className="absolute -left-10 w-6 h-6 rounded-full bg-[#080C15] border-r border-white/10"></div>
              <div className="absolute -right-10 w-6 h-6 rounded-full bg-[#080C15] border-l border-white/10"></div>
              <div className="border-t-2 border-dashed border-white/15 w-full"></div>
            </div>

            {/* QR Code Container */}
            <div className="text-center pt-2">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl shadow-cyan-500/10 border-4 border-cyan-400/30">
                <img
                  src={qrImageUrl}
                  alt="Parking Gate QR"
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>
              <p className="text-xs font-bold text-slate-300 mt-4 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Scan at Gate Scanner Barrier
              </p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                TOKEN: {booking.bookingReference} • SECURE
              </p>
            </div>
          </div>

          {/* Ticket Footer Action - Connected Test Scanner with Pre-filled Ref */}
          <div className="p-4 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between text-xs">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
            >
              <Download className="w-4 h-4" /> Download / Print Pass
            </button>
            <Link
              to={`/gate-scanner?ref=${encodeURIComponent(booking.bookingReference)}`}
              className="px-3.5 py-1.5 rounded-xl btn-primary font-bold text-[11px] flex items-center gap-1 shadow-md"
            >
              <span>Test Scanner</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

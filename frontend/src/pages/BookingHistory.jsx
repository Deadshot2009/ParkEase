import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  SquareParking, 
  MapPin, 
  Clock, 
  QrCode, 
  Download, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Calendar,
  Filter,
  Car
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingHistory() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = activeTab === 'ALL' ? '/bookings/my-bookings' : `/bookings/my-bookings?status=${activeTab}`;
      const res = await api.get(url);
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The slot will be released and a refund processed to your UPI account.')) {
      return;
    }
    try {
      setCancellingId(bookingId);
      const res = await api.post(`/bookings/${bookingId}/cancel`, {
        reason: 'User cancelled via Dashboard'
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewReceipt = async (bookingId) => {
    try {
      const res = await api.get(`/payments/receipt/${bookingId}`);
      if (res.data.success) {
        setReceiptData(res.data.data);
      }
    } catch (err) {
      alert('Failed to generate receipt');
    }
  };

  return (
    <div className="relative text-white py-10 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Pass Registry
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">Booking & Payment History</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your active parking reservations, passes, and tax receipts.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl btn-emerald text-xs font-bold transition-all"
          >
            + New Reservation
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          {[
            { id: 'ALL', label: 'All Bookings' },
            { id: 'ACTIVE', label: '🟢 Active & Upcoming' },
            { id: 'COMPLETED', label: '✓ Completed' },
            { id: 'CANCELLED', label: '✕ Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-glow'
                  : 'glass-panel-subtle text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-white/10">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No bookings found in this category</h3>
              <p className="text-xs text-slate-400 mt-1">Reserve a parking slot anytime to see your history here.</p>
            </div>
          ) : (
            bookings.map((b) => {
              const isActive = b.bookingStatus === 'ACTIVE';
              const isCompleted = b.bookingStatus === 'COMPLETED';
              const isCancelled = b.bookingStatus === 'CANCELLED';

              return (
                <div
                  key={b._id}
                  className="glass-panel-interactive rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left Column: Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-300 bg-[#040711]/70 px-2.5 py-1 rounded-md border border-white/5">
                        {b.bookingReference}
                      </span>

                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active Pass
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Completed
                        </span>
                      )}
                      {isCancelled && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Cancelled
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{b.locationName}</h3>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                      <span className="font-mono font-bold text-emerald-400">
                        Bay {b.slotNumber} ({b.floor})
                      </span>
                      <span>•</span>
                      <span className="font-mono text-white font-semibold">{b.vehicle?.plateNumber}</span>
                      <span>•</span>
                      <span className="text-slate-400">
                        {new Date(b.startTime).toLocaleDateString()} ({b.durationHours} hrs)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Paid: <span className="font-mono text-white font-semibold">₹{b.totalAmount}</span> via {b.paymentMethod}
                    </p>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* View QR Pass */}
                    {!isCancelled && (
                      <Link
                        to={`/ticket/${b._id}`}
                        className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Pass</span>
                      </Link>
                    )}

                    {/* Download Tax Receipt */}
                    <button
                      onClick={() => handleViewReceipt(b._id)}
                      className="px-3.5 py-2 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Receipt</span>
                    </button>

                    {/* Cancel button */}
                    {isActive && (
                      <button
                        disabled={cancellingId === b._id}
                        onClick={() => handleCancelBooking(b._id)}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{cancellingId === b._id ? 'Cancelling...' : 'Cancel'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Tax Invoice / Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="glass-panel rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl text-white animate-fadeIn border border-white/15">
            <div className="flex justify-between items-center pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-black text-white">Official Tax Invoice</h3>
                <p className="text-[11px] font-mono text-emerald-400 font-bold">{receiptData.receiptNumber}</p>
              </div>
              <button
                onClick={() => setReceiptData(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3.5 bg-[#040711]/70 rounded-2xl border border-white/10">
                <p className="font-bold text-white">{receiptData.issuer?.companyName}</p>
                <p className="text-slate-400 text-[10px]">GSTIN: {receiptData.issuer?.gstin}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Billed To</p>
                  <p className="font-semibold text-white">{receiptData.billedTo?.name}</p>
                  <p className="text-[11px] text-slate-400">{receiptData.billedTo?.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Parking Facility</p>
                  <p className="font-semibold text-white">{receiptData.location?.name}</p>
                  <p className="text-[11px] text-slate-400">{receiptData.parkingDetails?.floor} • Bay {receiptData.parkingDetails?.slotNumber}</p>
                </div>
              </div>

              <div className="border-t border-white/[0.08] pt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-medium text-white">{receiptData.parkingDetails?.durationHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-medium text-white">₹{receiptData.financialBreakdown?.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GST (18%)</span>
                  <span className="font-medium text-white">₹{receiptData.financialBreakdown?.taxes}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-emerald-400 pt-2 border-t border-white/[0.08]">
                  <span>Total Paid</span>
                  <span className="font-mono text-base">₹{receiptData.financialBreakdown?.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 btn-emerald text-xs font-bold rounded-xl"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

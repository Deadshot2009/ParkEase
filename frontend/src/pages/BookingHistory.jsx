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
  Car,
  Compass,
  ArrowRight
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
        
        {/* Header with Title and Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">My Parking Reservations</h1>
            <p className="text-xs text-slate-400 mt-1">
              View your active gate passes, past bookings, and tax receipts.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-white/10 overflow-x-auto">
            {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-indigo-glow border border-indigo-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 glass-panel rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border border-white/10 p-8 shadow-xl">
            <Compass className="w-14 h-14 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No Parking Reservations Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'ALL'
                ? "You haven't reserved any parking bays yet. Explore our live locations and book in advance."
                : `You do not have any ${activeTab.toLowerCase()} reservations at the moment.`}
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-xs font-bold transition-all shadow-lg"
            >
              <span>Find & Reserve a Bay</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const isActive = b.bookingStatus === 'ACTIVE' || b.bookingStatus === 'CONFIRMED';
              const isCompleted = b.bookingStatus === 'COMPLETED';
              const isCancelled = b.bookingStatus === 'CANCELLED';

              return (
                <div
                  key={b._id}
                  className={`glass-panel p-5 sm:p-6 rounded-3xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                    isActive ? 'border-indigo-500/40 shadow-indigo-glow' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 font-mono font-black border ${
                        isActive
                          ? 'bg-indigo-600/20 text-cyan-300 border-indigo-500/40'
                          : isCompleted
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      }`}
                    >
                      <span className="text-xs text-slate-400 font-sans font-medium">BAY</span>
                      <span className="text-lg">{b.slotNumber}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                            isActive
                              ? 'bg-indigo-500/20 text-cyan-300 border border-indigo-500/30'
                              : isCompleted
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                        <span className="text-xs font-mono text-slate-400">Ref: {b.bookingReference}</span>
                      </div>

                      <h3 className="text-base font-bold text-white">{b.locationName}</h3>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-mono text-slate-200">{b.vehicle?.plateNumber}</span> ({b.vehicle?.makeModel})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Fare */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0 border-t md:border-t-0 border-white/[0.08]">
                    <div className="text-left md:text-right mr-2">
                      <span className="text-[10px] text-slate-400 block uppercase">Fare Paid</span>
                      <span className="text-base font-black text-cyan-400 font-mono">₹{b.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <>
                          <Link
                            to={`/ticket/${b._id}`}
                            className="px-3.5 py-2 rounded-xl btn-primary text-xs font-bold flex items-center gap-1.5 shadow-md"
                          >
                            <QrCode className="w-4 h-4 stroke-[2.5]" />
                            <span>Gate Pass</span>
                          </Link>

                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            disabled={cancellingId === b._id}
                            className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold border border-rose-500/30 transition-colors"
                          >
                            {cancellingId === b._id ? 'Releasing...' : 'Cancel'}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleViewReceipt(b._id)}
                        className="px-3 py-2 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-xs font-bold text-slate-300 flex items-center gap-1.5 border border-white/10 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tax Receipt Modal */}
        {receiptData && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <SquareParking className="w-6 h-6 text-cyan-400" />
                  <span className="text-base font-black text-white">ParkEase Tax Invoice</span>
                </div>
                <button
                  onClick={() => setReceiptData(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="py-6 space-y-4 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Invoice No:</span>
                  <span className="font-mono text-white font-bold">{receiptData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Customer:</span>
                  <span className="text-white">{receiptData.customer?.name} ({receiptData.customer?.email})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Vehicle:</span>
                  <span className="font-mono text-cyan-300 font-bold">{receiptData.vehicle?.plateNumber}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bay Allocated:</span>
                  <span className="font-mono text-white font-bold">{receiptData.booking?.slotNumber} ({receiptData.booking?.floor})</span>
                </div>
                
                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Parking Charge:</span>
                    <span className="font-mono text-white">₹{receiptData.charges?.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18%):</span>
                    <span className="font-mono text-white">₹{receiptData.charges?.taxes}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/5">
                    <span>Total Paid:</span>
                    <span className="text-cyan-400 font-mono text-base">₹{receiptData.charges?.totalAmount}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400">
                  Payment Status: <span className="text-cyan-400 font-bold">PAID</span> via {receiptData.payment?.method} • Trans ID: {receiptData.payment?.transactionId}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl btn-primary text-xs font-bold"
                >
                  Print Invoice
                </button>
                <button
                  onClick={() => setReceiptData(null)}
                  className="px-4 py-2 rounded-xl glass-panel-subtle text-xs font-bold text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SquareParking, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Zap
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draft, setDraft] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI_GPAY');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('parkease_draft_booking');
    if (!raw) {
      navigate('/dashboard');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setDraft(parsed);
      setUpiId(`${user?.name?.toLowerCase().replace(/\s+/g, '') || 'alex'}@okaxis`);
    } catch (e) {
      navigate('/dashboard');
    }
  }, [navigate, user]);

  if (!draft) return null;

  const handlePayAndConfirm = async () => {
    if (processing) return; // Prevent double click duplicate submission
    try {
      setProcessing(true);
      setErrorMsg('');

      // Send reservation request to backend with concurrency lock
      const res = await api.post('/bookings', {
        locationId: draft.locationId,
        slotId: draft.slotId,
        vehicle: draft.vehicle,
        startTime: draft.startTime,
        endTime: draft.endTime,
        durationHours: draft.durationHours,
        paymentMethod: paymentMethod === 'UPI_GPAY' ? 'Google Pay UPI' : (paymentMethod === 'UPI_PHONEPE' ? 'PhonePe UPI' : 'Paytm / NetBanking'),
        upiId: upiId
      });

      if (res.data.success) {
        // Clear draft
        sessionStorage.removeItem('parkease_draft_booking');
        // Redirect directly to QR Boarding Pass
        navigate(`/ticket/${res.data.data._id}?new=true`);
      }
    } catch (err) {
      console.error('Booking failed:', err);
      setErrorMsg(err.response?.data?.message || 'Payment or reservation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="relative text-white py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to slot map
          </button>
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Checkout
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left summary card (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Booking Summary
              </span>
              <h2 className="text-xl font-black text-white mt-2 mb-4">
                {draft.locationName}
              </h2>

              <div className="p-4 bg-[#040711]/70 rounded-2xl border border-white/10 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Reserved Bay:</span>
                  <span className="font-mono font-bold text-base text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                    Slot {draft.slotNumber}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Floor:</span>
                  <span className="text-slate-200 font-medium">{draft.floor} ({draft.slotType})</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="font-mono text-white font-bold">{draft.vehicle?.plateNumber}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-slate-200 font-medium">{draft.durationHours} Hours reserved</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Entry Window:</span>
                  <span className="text-slate-200 font-medium">
                    {new Date(draft.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-5 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Guaranteed slot locked. Atomic anti double-booking check passed.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automated QR Boom Barrier Entry Pass generated immediately.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right payment card (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Select UPI / Payment
              </span>
              <h3 className="text-base font-bold text-white mt-2 mb-4">Payment Method</h3>

              {/* Payment Method Radio Options */}
              <div className="space-y-2 mb-4">
                <label
                  onClick={() => setPaymentMethod('UPI_GPAY')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI_GPAY'
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-emerald-glow'
                      : 'bg-[#040711]/60 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold">Google Pay / UPI</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Fast
                  </span>
                </label>

                <label
                  onClick={() => setPaymentMethod('UPI_PHONEPE')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI_PHONEPE'
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-emerald-glow'
                      : 'bg-[#040711]/60 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold">PhonePe UPI</span>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-emerald-glow'
                      : 'bg-[#040711]/60 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold">Cards / NetBanking</span>
                  </div>
                </label>
              </div>

              {/* UPI ID input */}
              <div className="mb-5">
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">UPI Virtual Payment ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  className="w-full bg-[#040711]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Price summary */}
              <div className="pt-4 border-t border-white/[0.08] space-y-1.5 text-xs mb-5">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">₹{draft.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes (18% GST)</span>
                  <span className="text-white font-medium">₹{draft.taxes}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2.5 border-t border-white/[0.08]">
                  <span>Total Amount</span>
                  <span className="text-emerald-400 text-lg font-mono">₹{draft.totalAmount}</span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                disabled={processing}
                onClick={handlePayAndConfirm}
                className="w-full py-3.5 rounded-xl btn-emerald text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#040711] border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Secure UPI Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{draft.totalAmount} & Get QR Pass</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

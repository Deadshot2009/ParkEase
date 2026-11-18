import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SquareParking, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Building2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [draft, setDraft] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, NETBANKING
  
  // UPI State
  const [upiId, setUpiId] = useState('driver@okaxis');
  
  // Card State
  const [cardHolder, setCardHolder] = useState(user?.name || 'Alex Mercer');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('742');

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('parkease_draft_booking');
    if (!raw) {
      navigate('/dashboard');
      return;
    }
    setDraft(JSON.parse(raw));
  }, [navigate]);

  if (!draft) return null;

  const handleConfirmAndPay = async () => {
    // Prevent duplicate API calls on multiple clicks
    if (processing) return;

    try {
      setProcessing(true);
      setErrorMsg('');

      let finalPaymentMethod = '';
      if (paymentMethod === 'UPI') {
        finalPaymentMethod = `UPI (${upiId})`;
      } else if (paymentMethod === 'CARD') {
        finalPaymentMethod = `Debit/Credit Card (Ending in ${cardNumber.slice(-4)})`;
      } else {
        finalPaymentMethod = `Net Banking (${selectedBank})`;
      }

      const payload = {
        locationId: draft.locationId,
        slotId: draft.slotId,
        vehicle: draft.vehicle,
        startTime: draft.startTime,
        endTime: draft.endTime,
        durationHours: draft.durationHours,
        paymentMethod: finalPaymentMethod,
        totalAmount: draft.totalAmount
      };

      const res = await api.post('/bookings', payload);

      if (res.data.success) {
        // Clear draft from storage
        sessionStorage.removeItem('parkease_draft_booking');
        // Navigate directly to the generated QR ticket page
        navigate(`/ticket/${res.data.data._id}`);
      } else {
        setErrorMsg(res.data.message || 'Booking submission failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMsg(
        err.response?.data?.message || 'Transaction could not be completed. The slot may have expired.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="relative text-white py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-3xl mx-auto">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Review & Checkout</h1>
              <p className="text-xs text-slate-400">Step 2 of 2: Final Payment & QR Generation</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            256-bit Secure Session
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          
          {/* Left Col: Order Summary (3 cols) */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Reservation Summary Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Reserved Bay</span>
                <span className="text-sm font-black font-mono text-white bg-indigo-500/25 px-3 py-1 rounded-full border border-indigo-500/40">
                  {draft.slotNumber} ({draft.slotType})
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{draft.locationName}</h3>
                <p className="text-xs text-slate-400 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-400 shrink-0" />
                  {draft.locationAddress}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08] text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Vehicle Plate</span>
                  <span className="font-mono font-bold text-cyan-300 mt-0.5 block">{draft.vehicle.plateNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Floor Level</span>
                  <span className="font-bold text-white mt-0.5 block">{draft.floor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Arrival Time</span>
                  <span className="font-mono text-white mt-0.5 block">
                    {new Date(draft.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Duration</span>
                  <span className="font-bold text-white mt-0.5 block">{draft.durationHours} Hours</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Payment Method</h3>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI', label: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
                  { id: 'CARD', label: 'Debit / Credit', desc: 'Visa, Master, RuPay' },
                  { id: 'NETBANKING', label: 'Net Banking', desc: 'All Major Banks' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      paymentMethod === m.id
                        ? 'bg-indigo-600/25 border-indigo-500 shadow-indigo-glow text-white'
                        : 'glass-panel-subtle border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-bold">{m.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{m.desc}</p>
                  </button>
                ))}
              </div>

              {/* UPI Option */}
              {paymentMethod === 'UPI' && (
                <div className="pt-2 space-y-2">
                  <label className="text-[11px] text-slate-400 block">UPI Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi or name@okaxis"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60 font-mono"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['@okhdfcbank', '@okaxis', '@ybl', '@paytm'].map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => {
                          const base = upiId.split('@')[0] || 'driver';
                          setUpiId(base + handle);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-cyan-300 font-mono border border-white/5 transition-colors"
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Option */}
              {paymentMethod === 'CARD' && (
                <div className="pt-2 space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Name on Card</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Cardholder Name"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Valid Thru (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NetBanking Option */}
              {paymentMethod === 'NETBANKING' && (
                <div className="pt-2 space-y-3">
                  <label className="text-[11px] text-slate-400 block">Select Authorized Bank</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                          selectedBank === b
                            ? 'bg-indigo-600/30 text-white border-indigo-400 shadow-indigo-glow'
                            : 'bg-white/[0.03] text-slate-300 border-white/5 hover:bg-white/[0.06]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Col: Price Card & Pay Button (2 cols) */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-3 border-b border-white/[0.08]">
              Fare Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Parking Base Fee</span>
                <span className="font-mono text-white">₹{draft.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Convenience</span>
                <span className="text-cyan-400 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Integrated GST (18%)</span>
                <span className="font-mono text-white">₹{draft.taxes}</span>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-slate-400">Total Payable</span>
                  <p className="text-2xl font-black text-cyan-400 font-mono">₹{draft.totalAmount}</p>
                </div>
                <span className="text-[10px] text-slate-400">Includes all taxes</span>
              </div>
            </div>

            <button
              onClick={handleConfirmAndPay}
              disabled={processing}
              className="w-full py-4 rounded-2xl btn-primary text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Securing Bay with Bank...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{draft.totalAmount} & Generate QR</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            <div className="space-y-2 text-[10px] text-slate-400 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant Automatic Refund if Cancelled</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Encrypted gate token sent immediately</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

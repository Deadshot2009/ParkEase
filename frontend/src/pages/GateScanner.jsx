import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Car, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  LogOut,
  LogIn
} from 'lucide-react';
import api from '../services/api';

export default function GateScanner() {
  const [searchParams] = useSearchParams();
  const [qrInput, setQrInput] = useState(searchParams.get('ref') || '');
  const [gateAction, setGateAction] = useState('ENTRY'); // ENTRY or EXIT
  const [gateId, setGateId] = useState('Main Plaza Barrier #01');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [barrierOpen, setBarrierOpen] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    if (searchParams.get('ref')) {
      handleVerify(searchParams.get('ref'));
    }
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/entry/logs');
      if (res.data.success) {
        setRecentLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const handleVerify = async (val) => {
    const dataToSend = val || qrInput;
    if (!dataToSend) {
      setErrorMsg('Please enter or scan a QR code payload or booking reference');
      return;
    }

    try {
      setScanning(true);
      setErrorMsg('');
      setResult(null);

      const res = await api.post('/entry/verify-qr', {
        qrData: dataToSend,
        gateId,
        action: gateAction
      });

      if (res.data.success) {
        setResult(res.data);
        setBarrierOpen(true);
        fetchLogs();

        // Auto close barrier after 5 seconds
        setTimeout(() => {
          setBarrierOpen(false);
        }, 6000);
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setErrorMsg(err.response?.data?.message || 'Access Denied: Invalid or expired ticket QR');
      setBarrierOpen(false);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="relative text-white py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Smart Boom Barrier Interface
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-3">
            Automated Parking Gate Scanner
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Simulates physical entrance & exit gate barrier scanners with real-time optical validation & bay status release.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Barrier Animation & Status (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Visual Boom Barrier Animation Box with Glassmorphism */}
            <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-7 shadow-2xl relative overflow-hidden text-center bg-parking-stripes">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${barrierOpen ? 'bg-[#00E676] animate-ping' : 'bg-rose-500'}`}></span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {gateId}
                  </span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                  barrierOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-glow' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {barrierOpen ? 'BARRIER LIFTED (OPEN)' : 'BARRIER LOWERED (LOCKED)'}
                </span>
              </div>

              {/* Graphic Representation of Boom Barrier */}
              <div className="py-14 relative flex items-center justify-center">
                
                {/* Traffic light */}
                <div className="absolute left-6 top-10 bg-[#040711]/90 border border-white/10 p-2.5 rounded-2xl flex flex-col gap-2.5 shadow-2xl">
                  <div className={`w-4 h-4 rounded-full transition-all ${!barrierOpen ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : 'bg-slate-800'}`}></div>
                  <div className={`w-4 h-4 rounded-full transition-all ${barrierOpen ? 'bg-[#00E676] shadow-[0_0_14px_#00E676]' : 'bg-slate-800'}`}></div>
                </div>

                {/* Barrier Arm Animation */}
                <div className="relative w-72 h-36 flex items-end justify-center">
                  {/* Base pillar */}
                  <div className="w-12 h-24 bg-gradient-to-t from-slate-900 to-slate-700 border border-slate-600 rounded-t-xl z-20 flex flex-col items-center justify-center shadow-lg">
                    <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse"></div>
                  </div>

                  {/* Arm */}
                  <div
                    className={`absolute bottom-16 left-32 w-52 h-4 rounded-full origin-left transition-transform duration-1000 z-10 shadow-lg ${
                      barrierOpen ? '-rotate-75' : 'rotate-0'
                    }`}
                    style={{
                      background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 12px, #ffffff 12px, #ffffff 24px)'
                    }}
                  ></div>

                  {/* Ground base */}
                  <div className="absolute bottom-0 w-full h-2.5 bg-slate-800 rounded-full border border-white/5"></div>
                </div>

              </div>

              {/* Dynamic status readout */}
              {result ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-left animate-fadeIn shadow-emerald-glow">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{result.message}</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>Reference: <span className="font-mono text-white font-bold">{result.data.booking?.bookingReference}</span></p>
                    <p>Reserved Bay: <span className="font-mono text-emerald-400 font-bold">{result.data.booking?.slotNumber}</span></p>
                    <p>Vehicle: <span className="font-mono text-white font-semibold">{result.data.booking?.vehicle?.plateNumber}</span></p>
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-left animate-fadeIn">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMsg}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Awaiting vehicle QR presentation at gate optical reader...
                </p>
              )}

            </div>

            {/* Recent Gate Scan Logs Table */}
            <div className="glass-panel rounded-2xl border border-white/10 p-5 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Recent Barrier Activity</span>
                <button onClick={fetchLogs} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                {recentLogs.map((log) => (
                  <div key={log._id} className="p-3 bg-[#040711]/60 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-white">{log.plateNumber || 'VEHICLE'}</span>
                      <span className="text-slate-400 ml-2">Bay {log.slotNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.action === 'ENTRY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: QR Presentation Form (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-7 shadow-2xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Scanner Terminal
              </span>
              <h3 className="text-base font-bold text-white mt-2 mb-4">
                Scan Pass or Enter Reference
              </h3>

              {/* Mode Switcher: Entry or Exit */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setGateAction('ENTRY')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    gateAction === 'ENTRY'
                      ? 'btn-emerald text-[#040711]'
                      : 'glass-panel-subtle text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrance Gate</span>
                </button>

                <button
                  onClick={() => setGateAction('EXIT')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    gateAction === 'EXIT'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'glass-panel-subtle text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Gate</span>
                </button>
              </div>

              {/* Input for QR / Ref */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    Booking Reference or Full QR JSON
                  </label>
                  <textarea
                    rows={4}
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="e.g. PE-2026-90412 or paste QR code string..."
                    className="w-full bg-[#040711]/80 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                {/* Preset quick test buttons */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">Quick Test Passes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => {
                        setQrInput('PE-2026-90412');
                        handleVerify('PE-2026-90412');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-emerald-300 border border-white/10 transition-colors"
                    >
                      PE-2026-90412 (Alex Mercer G-02)
                    </button>
                    <button
                      onClick={() => {
                        setQrInput('PE-2026-87140');
                        handleVerify('PE-2026-87140');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-slate-300 border border-white/10 transition-colors"
                    >
                      PE-2026-87140 (Past Ticket)
                    </button>
                  </div>
                </div>

                <button
                  disabled={scanning}
                  onClick={() => handleVerify()}
                  className="w-full py-3.5 rounded-xl btn-emerald text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  <QrCode className="w-4 h-4 stroke-[2.5]" />
                  <span>{scanning ? 'Verifying with Backend...' : 'Scan & Open Boom Barrier'}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

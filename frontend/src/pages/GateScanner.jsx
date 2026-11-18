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

        // Auto close barrier after 6 seconds
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
          <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
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
                  <span className={`w-3 h-3 rounded-full ${barrierOpen ? 'bg-cyan-400 animate-ping' : 'bg-rose-500'}`}></span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {gateId}
                  </span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                  barrierOpen ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {barrierOpen ? 'BARRIER LIFTED (OPEN)' : 'BARRIER LOWERED (LOCKED)'}
                </span>
              </div>

              {/* Graphic Representation of Boom Barrier */}
              <div className="py-14 relative flex items-center justify-center">
                
                {/* Traffic light */}
                <div className="absolute left-6 top-10 bg-[#0B0F19]/90 border border-white/10 p-2.5 rounded-2xl flex flex-col gap-2.5 shadow-2xl">
                  <div className={`w-4 h-4 rounded-full transition-all ${!barrierOpen ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : 'bg-slate-800'}`}></div>
                  <div className={`w-4 h-4 rounded-full transition-all ${barrierOpen ? 'bg-emerald-400 shadow-[0_0_14px_#34d399]' : 'bg-slate-800'}`}></div>
                </div>

                {/* Barrier Arm Animation */}
                <div className="relative w-72 h-36 flex items-end justify-center">
                  {/* Base pillar */}
                  <div className="w-12 h-24 bg-gradient-to-t from-slate-900 to-indigo-900 border border-indigo-500/30 rounded-t-xl z-20 flex flex-col items-center justify-center shadow-lg">
                    <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse"></div>
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
                <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl text-left animate-fadeIn shadow-indigo-glow">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>{result.message}</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>Reference: <span className="font-mono text-white font-bold">{result.data.booking?.bookingReference}</span></p>
                    <p>Reserved Bay: <span className="font-mono text-cyan-400 font-bold">{result.data.booking?.slotNumber}</span></p>
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
                <button onClick={fetchLogs} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                {recentLogs.length === 0 ? (
                  <p className="text-center py-4 text-slate-500 text-xs">No barrier scans recorded yet.</p>
                ) : (
                  recentLogs.map((log) => (
                    <div key={log._id} className="p-3 bg-[#0B0F19]/80 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-white">{log.plateNumber || 'VEHICLE'}</span>
                        <span className="text-slate-400 ml-2">Bay {log.slotNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.action === 'ENTRY' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(log.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Simulated QR Optical Reader Form (5 cols) */}
          <div className="md:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Optical Scanner Console</h3>
                <p className="text-[11px] text-slate-400">Scan or enter ticket reference</p>
              </div>
            </div>

            {/* Action Mode Switcher */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Gate Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGateAction('ENTRY')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    gateAction === 'ENTRY'
                      ? 'bg-indigo-600 text-white shadow-indigo-glow border border-indigo-400/50'
                      : 'glass-panel-subtle text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  <LogIn className="w-4 h-4" /> Entrance Gate
                </button>
                <button
                  type="button"
                  onClick={() => setGateAction('EXIT')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    gateAction === 'EXIT'
                      ? 'bg-indigo-600 text-white shadow-indigo-glow border border-indigo-400/50'
                      : 'glass-panel-subtle text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  <LogOut className="w-4 h-4" /> Exit Gate
                </button>
              </div>
            </div>

            {/* Gate ID Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">Barrier Station ID</label>
              <select
                value={gateId}
                onChange={(e) => setGateId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60"
              >
                <option value="Main Plaza Barrier #01">Main Plaza Barrier #01</option>
                <option value="North Entrance Boom #02">North Entrance Boom #02</option>
                <option value="Underground Level Gate #03">Underground Level Gate #03</option>
              </select>
            </div>

            {/* QR Input */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Ticket Token / Booking Ref
              </label>
              <textarea
                rows={3}
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Paste encrypted JSON payload or Reference (e.g. PE-2026-XXXXX)..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500/60 font-mono"
              />
            </div>

            <button
              onClick={() => handleVerify()}
              disabled={scanning}
              className="w-full py-3.5 rounded-2xl btn-primary text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Token...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 stroke-[2.5]" />
                  <span>Verify Pass & Trigger Barrier</span>
                </>
              )}
            </button>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-cyan-400">💡 Quick Simulation Tip:</p>
              <p>Reserve any bay, navigate to the QR Ticket page, then copy the Booking Reference into this console to test barrier actuation.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

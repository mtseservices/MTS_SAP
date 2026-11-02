import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { subscribeFirestoreStatus, testFirestoreConnection } from '../../services/firebaseConfig';

export const OnlineStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeFirestoreStatus((newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'connected') {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await testFirestoreConnection();
    setIsSyncing(false);
  };

  const isOnline = status === 'connected';
  const isChecking = status === 'checking';

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleManualSync}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
          isOnline
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            : isChecking
            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 animate-pulse'
            : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
        }`}
      >
        {isSyncing || isChecking ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
        ) : isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        )}

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : isChecking ? 'bg-cyan-400' : 'bg-amber-400'}`} />
          <span className="hidden sm:inline font-mono text-[11px]">
            {isSyncing ? 'Syncing...' : isChecking ? 'Checking...' : isOnline ? 'Cloud Active' : 'Local Mode'}
          </span>
        </div>
      </button>

      {/* Tooltip / Status Popover */}
      {showTooltip && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              {isOnline ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : isChecking ? (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              )}
              Enterprise Reachability
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter ${isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {isOnline ? 'DIRECT CLOUD' : isChecking ? 'PENDING' : 'SANDBOXED'}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 leading-relaxed font-medium">
            {isOnline
              ? 'Real-time synchronization with Crest Textile Mills cloud infrastructure is active. All ledger entries are secure and globally consistent.'
              : isChecking
              ? 'Verifying secure tunnel to Firestore backend. Please wait...'
              : 'Network restrictions detected. AI Studio sandbox mode is active. Data is safely stored in local IndexedDB and will sync when restrictions are lifted.'}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>SDK Persistence:</span>
              <span className="text-emerald-400">ENABLED (v13.1)</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Local Storage:</span>
              <span className="text-cyan-400">IndexedDB Active</span>
            </div>
            <div className="mt-1 p-2 bg-slate-800/50 rounded-lg text-[10px] text-slate-400 italic">
              Click indicator to force connectivity re-verification.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

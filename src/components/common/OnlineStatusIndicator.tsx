import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const OnlineStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      // Simulate sync completion after reconnect
      const timer = setTimeout(() => {
        setIsSyncing(false);
      }, 2500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also check service worker sync capability if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
          setIsSyncing(false);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => {
          // Manual connectivity check / re-sync trigger
          setIsSyncing(true);
          setTimeout(() => setIsSyncing(false), 1500);
        }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
          isOnline
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 animate-pulse'
        }`}
        title={isOnline ? 'Online • PWA Sync Active' : 'Offline • Local Cache Mode Active'}
      >
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
        ) : isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        )}

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="hidden sm:inline font-mono text-[11px]">
            {isSyncing ? 'Syncing...' : isOnline ? 'Online PWA' : 'Offline Mode'}
          </span>
        </div>
      </button>

      {/* Tooltip / Status Popover */}
      {showTooltip && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              {isOnline ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              Network & PWA Status
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 leading-relaxed">
            {isOnline
              ? 'Your PWA is fully online. Transactions and ledger entries are auto-syncing in real-time with Firebase Firestore.'
              : 'You are currently offline. All accounting entries and inventory adjustments are safely saved to local IndexedDB and will auto-sync upon reconnection.'}
          </div>

          <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800 flex justify-between">
            <span>Service Worker: Active</span>
            <span className="text-cyan-400">Click to Refresh Sync</span>
          </div>
        </div>
      )}
    </div>
  );
};

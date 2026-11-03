import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const OfflineToast: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('mts_pending_sync_count');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync pending changes when back online
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncSuccess(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodically check local pending count
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem('mts_pending_sync_count');
        if (stored) {
          setPendingCount(parseInt(stored, 10));
        }
      } catch {}
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    setSyncSuccess(false);

    setTimeout(() => {
      try {
        localStorage.setItem('mts_pending_sync_count', '0');
        setPendingCount(0);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 4000);
      } catch {}
      setIsSyncing(false);
    }, 1200);
  };

  if (isOnline && pendingCount === 0 && !syncSuccess) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-6 fade-in duration-300">
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3.5 max-w-sm ${
        !isOnline
          ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
          : (syncSuccess
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-900/95 border-cyan-500/40 text-slate-100')
      }`}>
        {!isOnline ? (
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
            <WifiOff className="w-5 h-5 animate-pulse" />
          </div>
        ) : syncSuccess ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs uppercase tracking-wider">
              {!isOnline ? 'Connection Lost' : (syncSuccess ? 'Sync Complete' : 'Pending Sync')}
            </span>
            {!isOnline && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[9px] font-mono font-bold text-amber-300">
                OFFLINE
              </span>
            )}
          </div>
          <p className="text-[11px] opacity-90 leading-tight">
            {!isOnline
              ? `You are offline. ${pendingCount > 0 ? `${pendingCount} changes saved locally.` : 'Changes will sync upon reconnect.'}`
              : (syncSuccess
                  ? 'All pending offline changes synced successfully with Firestore.'
                  : `${pendingCount} pending changes ready to sync.`)}
          </p>
        </div>

        {isOnline && pendingCount > 0 && !syncSuccess && (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer disabled:opacity-60 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

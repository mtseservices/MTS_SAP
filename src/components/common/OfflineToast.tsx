import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, AlertTriangle, Database } from 'lucide-react';
import { OfflineSyncManagerModal } from './OfflineSyncManagerModal';
import { offlineStore } from '../../services/offlineStore';

export const OfflineToast: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to offlineStore status
    offlineStore.subscribeStatus((online, count) => {
      setIsOnline(online);
      setPendingCount(count);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      await offlineStore.synchronizePendingQueue();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0 && !syncSuccess) {
    return (
      <>
        {/* Floating trigger button to open Offline Sync Manager anytime */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsManagerOpen(true)}
            className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all group"
            title="Open Offline Sync Manager"
          >
            <Database className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Offline Sync</span>
          </button>
        </div>

        <OfflineSyncManagerModal
          isOpen={isManagerOpen}
          onClose={() => setIsManagerOpen(false)}
        />
      </>
    );
  }

  return (
    <>
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

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsManagerOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition flex items-center gap-1 shrink-0"
              title="Open Offline Sync Manager"
            >
              <Database className="w-4 h-4" />
            </button>
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
      </div>

      <OfflineSyncManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
      />
    </>
  );
};

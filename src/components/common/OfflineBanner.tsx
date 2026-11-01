import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { offlineStore } from '../../services/offlineStore';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    offlineStore.subscribeStatus((online, count) => {
      setIsOnline(online);
      setPendingCount(count);
    });
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    const result = await offlineStore.synchronizePendingQueue();
    setIsSyncing(false);
    if (result.syncedCount > 0) {
      setSyncMessage(`Synced ${result.syncedCount} offline transaction(s) to cloud!`);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-800/80 border-slate-700/80">
      {isOnline ? (
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Wifi className="w-3.5 h-3.5" />
          Online Sync
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-amber-400 animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          Offline Mode (IndexedDB)
        </span>
      )}

      {pendingCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={!isOnline || isSyncing}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all text-[11px]"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          {pendingCount} Pending Sync
        </button>
      )}

      {syncMessage && (
        <span className="flex items-center gap-1 text-emerald-300 text-[11px]">
          <CheckCircle2 className="w-3 h-3" />
          {syncMessage}
        </span>
      )}
    </div>
  );
};

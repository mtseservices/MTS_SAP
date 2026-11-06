import React, { useState, useEffect } from 'react';
import { 
  CloudOff, 
  Cloud, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Database,
  Save,
  Send
} from 'lucide-react';
import { offlineStore } from '../../services/offlineStore';
import { OfflineQueueItem } from '../../types/erp';

interface OfflineSyncManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineSyncManagerModal: React.FC<OfflineSyncManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [queueItems, setQueueItems] = useState<OfflineQueueItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<OfflineQueueItem | null>(null);
  const [editJson, setEditJson] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchQueue = async () => {
    const items = await offlineStore.getPendingQueue();
    setQueueItems(items);
    setIsOnline(offlineStore.isOnline());
  };

  useEffect(() => {
    if (isOpen) {
      fetchQueue();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setErrorMsg(null);
    try {
      const result = await offlineStore.synchronizePendingQueue();
      await fetchQueue();
      setSuccessMsg(`Successfully synced ${result.syncedCount} offline transaction(s) to Firebase!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearQueue = async () => {
    if (confirm('Are you sure you want to clear all pending offline transaction queue items?')) {
      // Clear IndexedDB store
      try {
        // @ts-ignore
        if (offlineStore['db']) {
          // @ts-ignore
          const tx = offlineStore['db'].transaction(['offline_queue'], 'readwrite');
          const store = tx.objectStore('offline_queue');
          store.clear();
        }
        await fetchQueue();
        setSuccessMsg('Offline queue successfully cleared.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err: any) {
        setErrorMsg('Failed to clear queue: ' + err.message);
      }
    }
  };

  const handleEditItem = (item: OfflineQueueItem) => {
    setSelectedItem(item);
    setEditJson(JSON.stringify(item.data, null, 2));
  };

  const handleSaveEditedItem = () => {
    if (!selectedItem) return;
    try {
      const parsedData = JSON.parse(editJson);
      // Update in IndexedDB
      // @ts-ignore
      if (offlineStore['db']) {
        // @ts-ignore
        const tx = offlineStore['db'].transaction(['offline_queue'], 'readwrite');
        const store = tx.objectStore('offline_queue');
        const updated = { ...selectedItem, data: parsedData };
        store.put(updated);
      }
      setSelectedItem(null);
      fetchQueue();
      setSuccessMsg('Transaction payload successfully updated in IndexedDB.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Invalid JSON format: ' + err.message);
    }
  };

  const pendingCount = queueItems.filter(i => !i.synced).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">IndexedDB Offline Sync Manager</h3>
              <p className="text-xs text-slate-400">
                Manage, edit, or force-sync offline transaction queue items before Firebase synchronization.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 border ${
              isOnline 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {isOnline ? <Cloud className="w-3.5 h-3.5 text-emerald-400" /> : <CloudOff className="w-3.5 h-3.5 text-amber-400" />}
              {isOnline ? 'Online (Firebase Connected)' : 'Offline Mode (IndexedDB Active)'}
            </span>

            <span className="text-slate-400 font-mono">
              Pending Queue: <strong className="text-cyan-400">{pendingCount} item(s)</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearQueue}
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Queue
            </button>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing || pendingCount === 0}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync to Firebase Now'}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {queueItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Database className="w-12 h-12 text-slate-700 mx-auto" />
              <div className="text-sm font-bold text-slate-300">Offline Queue is Empty</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All transactions have been successfully synchronized to Firebase Firestore, or no offline actions have been queued yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 text-xs">{item.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-amber-300 border border-slate-800">
                        {item.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.synced ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.synced ? 'SYNCED' : 'PENDING'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono">
                      Created: {new Date(item.createdAt).toLocaleString()}
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg font-mono max-w-lg truncate">
                      {JSON.stringify(item.data)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal Sub-view if item selected */}
        {selectedItem && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Edit Offline Payload</h4>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {selectedItem.id}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Transaction JSON Payload</label>
                <textarea
                  value={editJson}
                  onChange={(e) => setEditJson(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedItem}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
                >
                  <Save className="w-4 h-4" /> Save Changes to IndexedDB
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Close Manager
          </button>
        </div>

      </div>
    </div>
  );
};

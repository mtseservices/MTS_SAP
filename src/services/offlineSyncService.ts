import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface OfflineQueueItem {
  id: string;
  collectionPath: string;
  payload: any;
  createdAt: string;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'mts_erp_offline_mutation_queue';

/**
 * Get all queued offline mutations from localStorage.
 */
export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save mutation to offline queue when network is offline.
 */
export function queueOfflineMutation(collectionPath: string, payload: any): void {
  try {
    const queue = getOfflineQueue();
    const newItem: OfflineQueueItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      collectionPath,
      payload: {
        ...payload,
        createdAt: payload.createdAt || new Date().toISOString(),
        syncedOffline: true
      },
      createdAt: new Date().toISOString(),
      retryCount: 0
    };
    queue.push(newItem);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));

    // Try registering background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((reg: any) => {
        if (reg.sync) {
          reg.sync.register('sync-offline-queue').catch((err: any) => {
            console.warn('Background sync registration failed:', err);
          });
        }
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Error queuing offline mutation:', e);
  }
}

/**
 * Reconcile offline queue with Firestore once online connectivity is restored.
 */
export async function reconcileOfflineQueue(): Promise<{ successCount: number; failCount: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { successCount: 0, failCount: 0 };

  let successCount = 0;
  let failCount = 0;
  const remainingQueue: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      const colRef = collection(db, item.collectionPath);
      await addDoc(colRef, {
        ...item.payload,
        reconciledAt: serverTimestamp()
      });
      successCount++;
    } catch (err) {
      console.warn(`Failed to reconcile offline item ${item.id}:`, err);
      failCount++;
      if (item.retryCount < 5) {
        remainingQueue.push({ ...item, retryCount: item.retryCount + 1 });
      }
    }
  }

  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));
  } catch (e) {}

  return { successCount, failCount };
}

/**
 * Initialize global event listeners for automatic offline reconciliation upon reconnection.
 */
export function initOfflineSyncListener(onSyncComplete?: (res: { successCount: number; failCount: number }) => void) {
  if (typeof window === 'undefined') return;

  const handleOnlineReconcile = async () => {
    if (navigator.onLine) {
      const res = await reconcileOfflineQueue();
      if (res.successCount > 0 && onSyncComplete) {
        onSyncComplete(res);
      }
    }
  };

  window.addEventListener('online', handleOnlineReconcile);

  // Also listen to messages from service worker background sync
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (event.data && event.data.type === 'TRIGGER_OFFLINE_SYNC') {
        const res = await reconcileOfflineQueue();
        if (res.successCount > 0 && onSyncComplete) {
          onSyncComplete(res);
        }
      }
    });
  }

  // Initial check on mount if online
  if (navigator.onLine) {
    handleOnlineReconcile();
  }
}

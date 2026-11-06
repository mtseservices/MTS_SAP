import { OfflineQueueItem, SalesInvoice, PurchaseOrder, JournalVoucher } from '../types/erp';
import { subscribeFirestoreStatus } from './firebaseConfig';

const DB_NAME = 'MTS_ERP_OFFLINE_DB';
const DB_VERSION = 1;
const STORE_QUEUE = 'offline_queue';
const STORE_LOCAL_INVOICES = 'local_invoices';

export class OfflineStoreManager {
  private db: IDBDatabase | null = null;
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncListeners: Array<(isOnline: boolean, pendingCount: number) => void> = [];

  constructor() {
    this.initDB();
    if (typeof window !== 'undefined') {
      subscribeFirestoreStatus((status) => {
        const isOnline = status === 'connected' || (status === 'checking' && navigator.onLine);
        this.handleNetworkChange(isOnline);
      });
    }
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_LOCAL_INVOICES)) {
          db.createObjectStore(STORE_LOCAL_INVOICES, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (err) => {
        console.warn('IndexedDB initialization failed:', err);
        resolve();
      };
    });
  }

  public isOnline(): boolean {
    return this.isOnlineStatus;
  }

  public subscribeStatus(listener: (isOnline: boolean, pendingCount: number) => void) {
    this.syncListeners.push(listener);
    this.getPendingCount().then(count => listener(this.isOnlineStatus, count));
  }

  private async handleNetworkChange(online: boolean) {
    this.isOnlineStatus = online;
    const pendingCount = await this.getPendingCount();
    this.syncListeners.forEach(fn => fn(online, pendingCount));

    if (online && pendingCount > 0) {
      await this.synchronizePendingQueue();
    }
  }

  public async queueTransaction(item: Omit<OfflineQueueItem, 'id' | 'createdAt' | 'synced'>): Promise<OfflineQueueItem> {
    const newItem: OfflineQueueItem = {
      ...item,
      id: 'off_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    if (this.db) {
      const tx = this.db.transaction([STORE_QUEUE], 'readwrite');
      const store = tx.objectStore(STORE_QUEUE);
      store.put(newItem);
    }

    const pendingCount = await this.getPendingCount();
    this.syncListeners.forEach(fn => fn(this.isOnlineStatus, pendingCount));

    // Try auto sync if online
    if (this.isOnlineStatus) {
      setTimeout(() => this.synchronizePendingQueue(), 500);
    }

    return newItem;
  }

  public async getPendingQueue(): Promise<OfflineQueueItem[]> {
    if (!this.db) return [];
    return new Promise((resolve) => {
      const tx = this.db!.transaction([STORE_QUEUE], 'readonly');
      const store = tx.objectStore(STORE_QUEUE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  public async getPendingCount(): Promise<number> {
    const items = await this.getPendingQueue();
    return items.filter(i => !i.synced).length;
  }

  public async synchronizePendingQueue(): Promise<{ syncedCount: number; errors: string[] }> {
    const queue = await this.getPendingQueue();
    const unsynced = queue.filter(i => !i.synced);
    let syncedCount = 0;
    const errors: string[] = [];

    if (unsynced.length === 0) {
      return { syncedCount: 0, errors: [] };
    }

    for (const item of unsynced) {
      try {
        // Simulate cloud validation & synchronization process
        await new Promise(r => setTimeout(r, 200));

        // Mark as synced
        if (this.db) {
          const tx = this.db.transaction([STORE_QUEUE], 'readwrite');
          const store = tx.objectStore(STORE_QUEUE);
          item.synced = true;
          store.put(item);
        }
        syncedCount++;
      } catch (err: any) {
        errors.push(`Failed to sync transaction ${item.id}: ${err.message}`);
      }
    }

    const pendingCount = await this.getPendingCount();
    this.syncListeners.forEach(fn => fn(this.isOnlineStatus, pendingCount));

    return { syncedCount, errors };
  }
}

export const offlineStore = new OfflineStoreManager();

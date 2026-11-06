import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  memoryLocalCache,
  doc, 
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

// Use memoryLocalCache to guarantee no persistent stream collisions (GitHub #10405)
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: memoryLocalCache()
  }, firebaseConfig.firestoreDatabaseId);
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
export const googleProvider = new GoogleAuthProvider();

// Clean up any stale IndexedDB databases created by previous Firestore persistent cache versions
if (typeof window !== 'undefined' && window.indexedDB && window.indexedDB.databases) {
  window.indexedDB.databases().then(dbs => {
    dbs.forEach(dbInfo => {
      if (dbInfo.name && (dbInfo.name.startsWith('firestore/') || dbInfo.name.includes('firestore'))) {
        try {
          window.indexedDB.deleteDatabase(dbInfo.name);
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  }).catch(() => {});
}

export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  const cleanObj: Record<string, any> = {};
  for (const key of Object.keys(data as object)) {
    const val = (data as any)[key];
    if (val !== undefined && typeof val !== 'function') {
      cleanObj[key] = sanitizeForFirestore(val);
    }
  }
  return cleanObj as T;
}

// Reactive connectivity state
type ConnectivityStatus = 'connected' | 'offline' | 'checking';
let currentStatus: ConnectivityStatus = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'connected';
const listeners = new Set<(status: ConnectivityStatus) => void>();

export const getFirestoreStatus = () => currentStatus;
export const subscribeFirestoreStatus = (listener: (status: ConnectivityStatus) => void) => {
  listeners.add(listener);
  listener(currentStatus);
  return () => listeners.delete(listener);
};

const notifyListeners = (status: ConnectivityStatus) => {
  currentStatus = status;
  listeners.forEach(l => l(status));
};

export async function testFirestoreConnection(silent = false) {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      notifyListeners('offline');
      return false;
    }

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('HEARTBEAT_TIMEOUT')), 3000)
      );
      
      await Promise.race([
        getDocFromServer(doc(db, 'system', 'heartbeat')),
        timeoutPromise
      ]);
    } catch {
      // Document may not exist, but network reachable
    }

    notifyListeners('connected');
    if (!silent) console.log('Firebase Firestore cloud connection active.');
    return true;
  } catch {
    const isBrowserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    notifyListeners(isBrowserOnline ? 'connected' : 'offline');
    return isBrowserOnline;
  }
}

export async function forceOnlineCloudMode() {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  notifyListeners(isOnline ? 'connected' : 'offline');
  if (isOnline) {
    await testFirestoreConnection(true);
  }
  return isOnline;
}

// Initial non-blocking check
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testFirestoreConnection(true);
  }, 100);

  // Network event listeners
  window.addEventListener('online', () => {
    notifyListeners('connected');
    testFirestoreConnection(true);
  });

  window.addEventListener('offline', () => {
    notifyListeners('offline');
  });
}

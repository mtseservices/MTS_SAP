import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  memoryLocalCache, 
  doc, 
  getDocFromServer,
  disableNetwork,
  enableNetwork
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  try {
    firestoreInstance = initializeFirestore(app, {
      localCache: memoryLocalCache(),
    }, firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = firestoreInstance;
export const googleProvider = new GoogleAuthProvider();

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
let currentStatus: ConnectivityStatus = 'checking';
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
    // Try a direct fetch from server with a very short timeout (not SDK timeout, but promise timeout)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('HEARTBEAT_TIMEOUT')), 3500)
    );
    
    await Promise.race([
      getDocFromServer(doc(db, 'system', 'heartbeat')),
      timeoutPromise
    ]);
    
    await enableNetwork(db);
    notifyListeners('connected');
    if (!silent) console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error: any) {
    // If it's a timeout or specific network error, disable network to prevent the 10s SDK retry loop
    await disableNetwork(db);
    notifyListeners('offline');
    if (!silent) {
      console.warn('Firebase operating in offline / local cache mode due to network constraints.');
    }
    return false;
  }
}

// Initial check
testFirestoreConnection();

// Periodically check if we can reconnect (every 60 seconds)
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (currentStatus === 'offline' && navigator.onLine) {
      testFirestoreConnection(true);
    }
  }, 60000);

  // Re-check when browser says it's back online
  window.addEventListener('online', () => {
    testFirestoreConnection(true);
  });
}

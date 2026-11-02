import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  memoryLocalCache, 
  doc, 
  getDocFromServer 
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

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'globalSettings'));
    console.log('Firebase Firestore connection verified.');
  } catch (error: any) {
    // Gracefully handle offline mode without uncaught console exceptions
    console.warn('Firebase operating in offline / local cache mode due to network sandbox constraints or connectivity issues.');
  }
}

testFirestoreConnection();

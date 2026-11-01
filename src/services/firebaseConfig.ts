import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection'));
    console.log('Firebase Firestore connection verified.');
  } catch (error: any) {
    if (error?.message?.includes('client is offline')) {
      console.warn('Firebase Firestore offline state active.');
    }
  }
}

testFirestoreConnection();

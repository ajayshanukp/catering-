import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "catering-workforce-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "catering-workforce-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "catering-workforce-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Check if emulator is requested
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

if (useEmulator && typeof window !== 'undefined') {
  try {
    const authPort = Number(import.meta.env.VITE_EMULATOR_AUTH_PORT) || 9099;
    const firestorePort = Number(import.meta.env.VITE_EMULATOR_FIRESTORE_PORT) || 8080;
    const storagePort = Number(import.meta.env.VITE_EMULATOR_STORAGE_PORT) || 9199;

    connectAuthEmulator(auth, `http://localhost:${authPort}`, { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', firestorePort);
    connectStorageEmulator(storage, 'localhost', storagePort);
    console.info(`Connected to Firebase Emulators (Auth:${authPort}, DB:${firestorePort}, Storage:${storagePort})`);
  } catch (e) {
    console.warn('Firebase emulator connection note:', e);
  }
}export const isFirebaseConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return !!apiKey && apiKey !== 'demo-api-key' && apiKey !== 'your-api-key';
};

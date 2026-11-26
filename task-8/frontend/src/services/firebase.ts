import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence, type Auth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Firebase configuration is provided through environment variables. Public
 * deployments built without those values should still be able to browse the
 * mission manifest, so authentication is disabled instead of crashing the app.
 */
export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

const app = isFirebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

export const auth: Auth | null = app ? getAuth(app) : null;
export const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;
export const authPersistence: Promise<void> = auth ? setPersistence(auth, browserLocalPersistence) : Promise.resolve();

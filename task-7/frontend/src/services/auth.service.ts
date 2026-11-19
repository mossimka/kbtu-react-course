import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    type User,
} from 'firebase/auth';
import { auth, authPersistence, googleProvider, isFirebaseConfigured } from './firebase';

export type AuthUser = User;

const requireAuth = () => {
    if (!auth || !isFirebaseConfigured) {
        throw new Error('Authentication is not configured for this deployment.');
    }
    return auth;
};

const requireGoogleProvider = () => {
    if (!googleProvider) {
        throw new Error('Google authentication is not configured for this deployment.');
    }
    return googleProvider;
};

export const ensureAuthPersistence = () => authPersistence;

export const loginRequest = async (email: string, password: string): Promise<AuthUser> => {
    const result = await signInWithEmailAndPassword(requireAuth(), email, password);
    return result.user;
};

export const registerRequest = async (name: string, email: string, password: string): Promise<AuthUser> => {
    const result = await createUserWithEmailAndPassword(requireAuth(), email, password);
    await updateProfile(result.user, { displayName: name.trim() });
    return result.user;
};

export const googleLoginRequest = async (): Promise<AuthUser> => {
    const result = await signInWithPopup(requireAuth(), requireGoogleProvider());
    return result.user;
};

export const logoutRequest = () => (auth ? signOut(auth) : Promise.resolve());

export const authErrorMessage = (error: unknown): string => {
    if (error instanceof Error && 'code' in error) {
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'The email or password is incorrect.';
            case 'auth/email-already-in-use':
                return 'An account already exists for this email.';
            case 'auth/weak-password':
                return 'Use a stronger password with at least 6 characters.';
            case 'auth/popup-closed-by-user':
                return 'Google sign-in was cancelled.';
            case 'auth/popup-blocked':
                return 'Allow popups in your browser to continue with Google.';
            case 'auth/invalid-api-key':
            case 'auth/configuration-not-found':
                return 'Authentication is not configured for this deployment.';
            default:
                return error.message;
        }
    }

    return 'Authentication failed. Please try again.';
};

export { GoogleAuthProvider, isFirebaseConfigured };

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    type User,
} from 'firebase/auth';
import { auth, authPersistence, googleProvider } from './firebase';

export type AuthUser = User;

export const ensureAuthPersistence = () => authPersistence;

export const loginRequest = async (email: string, password: string): Promise<AuthUser> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
};

export const registerRequest = async (name: string, email: string, password: string): Promise<AuthUser> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name.trim() });
    return result.user;
};

export const googleLoginRequest = async (): Promise<AuthUser> => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
};

export const logoutRequest = () => signOut(auth);

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
            default:
                return error.message;
        }
    }

    return 'Authentication failed. Please try again.';
};

export { GoogleAuthProvider };

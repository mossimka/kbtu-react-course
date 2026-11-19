import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { clearBackendToken, getBackendToken, setBackendToken } from './token';
import { apiRequest } from './service';
import { auth, authPersistence, googleProvider, isFirebaseConfigured } from './firebase';

/**
 * The rest of the UI only needs these fields. Firebase users satisfy this
 * shape, and the backend token fallback maps its profile into it.
 */
export type AuthUser = {
    uid: string;
    displayName: string | null;
    email: string | null;
    metadata: { creationTime?: string | null };
    role?: string;
};

type BackendUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
};

type BackendSession = {
    token: string;
    tokenType: string;
    expiresInSeconds: number;
    user: BackendUser;
};

const requireAuth = () => {
    if (!auth || !isFirebaseConfigured) {
        throw new Error('Firebase Authentication is not configured for this deployment.');
    }
    return auth;
};

const requireGoogleProvider = () => {
    if (!googleProvider) {
        throw new Error('Google authentication is not configured for this deployment.');
    }
    return googleProvider;
};

const normalizeBackendUser = (user: BackendUser): AuthUser => ({
    uid: String(user.id),
    displayName: user.name,
    email: user.email,
    metadata: { creationTime: user.createdAt },
    role: user.role,
});

export const ensureAuthPersistence = () => authPersistence;

/** True when the build has Firebase values and Google sign-in is available. */
export const isGoogleAuthConfigured = isFirebaseConfigured;

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

/* -------------------------------------------------------------------------- */
/* Backend token fallback                                                     */
/* -------------------------------------------------------------------------- */

const backendAuthRequest = async (path: string, body: Record<string, string>, signal?: AbortSignal) => {
    clearBackendToken();
    const session = await apiRequest<BackendSession>(path, { method: 'POST', body: JSON.stringify(body) }, signal);
    setBackendToken(session.token);
    return normalizeBackendUser(session.user);
};

export const backendLoginRequest = (email: string, password: string) =>
    backendAuthRequest('/api/auth/login', { email, password });

export const backendRegisterRequest = (name: string, email: string, password: string) =>
    backendAuthRequest('/api/auth/register', { name, email, password });

export const restoreBackendSession = async (signal?: AbortSignal): Promise<AuthUser | null> => {
    if (!getBackendToken()) return null;

    try {
        const user = await apiRequest<BackendUser>('/api/auth/me', {}, signal);
        return normalizeBackendUser(user);
    } catch {
        if (!signal?.aborted) clearBackendToken();
        return null;
    }
};

export const backendLogoutRequest = async () => {
    if (!getBackendToken()) return;
    try {
        await apiRequest<void>('/api/auth/logout', { method: 'POST' });
    } finally {
        clearBackendToken();
    }
};

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

    return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
};

export { GoogleAuthProvider, isFirebaseConfigured };

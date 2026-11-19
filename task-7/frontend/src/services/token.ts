const BACKEND_TOKEN_KEY = 'orbital.backend-auth-token';

/**
 * Token storage for the backend fallback used when Firebase is not configured
 * for a build. It lives in local storage on the device only and is never
 * written to a shared service-worker cache.
 */
export const getBackendToken = (): string | null => {
    try {
        return window.localStorage.getItem(BACKEND_TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setBackendToken = (token: string) => {
    try {
        window.localStorage.setItem(BACKEND_TOKEN_KEY, token);
    } catch {
        // Session storage may be unavailable in private browsing modes.
    }
};

export const clearBackendToken = () => {
    try {
        window.localStorage.removeItem(BACKEND_TOKEN_KEY);
    } catch {
        // Nothing to clear when storage is unavailable.
    }
};

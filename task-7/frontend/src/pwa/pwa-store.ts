export type PwaState = {
    online: boolean;
    serviceWorkerSupported: boolean;
    updateAvailable: boolean;
    applyingUpdate: boolean;
    updateDismissed: boolean;
    registrationError: string | null;
    /** True once a freshly installed worker has taken control of this page. */
    firstControl: boolean;
    usingCachedData: boolean;
    cachedAt: number | null;
    cacheAgeSeconds: number | null;
};

type Listener = () => void;

const listeners = new Set<Listener>();

const getInitialOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine);

let state: PwaState = {
    online: getInitialOnline(),
    serviceWorkerSupported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    updateAvailable: false,
    applyingUpdate: false,
    updateDismissed: false,
    registrationError: null,
    firstControl: false,
    usingCachedData: false,
    cachedAt: null,
    cacheAgeSeconds: null,
};

const notify = () => {
    listeners.forEach((listener) => listener());
};

export const getPwaState = () => state;

export const subscribePwa = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const setPwaState = (patch: Partial<PwaState>) => {
    state = { ...state, ...patch };
    notify();
};

export const setOnlineStatus = (online: boolean) => {
    setPwaState({ online });
};

/**
 * Called by the API layer whenever an API response arrives. The service worker
 * adds X-PWA-Cache headers to responses it serves from its runtime cache so the
 * interface can clearly distinguish live and saved data.
 */
export const reportApiCacheStatus = (cached: boolean, ageSeconds: number | null = null) => {
    if (cached) {
        setPwaState({
            usingCachedData: true,
            cacheAgeSeconds: ageSeconds,
            cachedAt: ageSeconds ? Date.now() - ageSeconds * 1000 : Date.now(),
        });
        return;
    }

    setPwaState({ usingCachedData: false, cachedAt: null, cacheAgeSeconds: null });
};

export const markUpdateAvailable = () => {
    setPwaState({ updateAvailable: true, updateDismissed: false, applyingUpdate: false });
};

export const dismissUpdate = () => {
    setPwaState({ updateDismissed: true });
};

export const markApplyingUpdate = () => {
    setPwaState({ applyingUpdate: true, updateDismissed: true });
};

export const markServiceWorkerError = (message: string) => {
    setPwaState({ registrationError: message });
};

export const markServiceWorkerReady = () => {
    setPwaState({ registrationError: null });
};

export const markFirstControl = () => {
    setPwaState({ firstControl: true });
};

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setOnlineStatus(true));
    window.addEventListener('offline', () => setOnlineStatus(false));
}

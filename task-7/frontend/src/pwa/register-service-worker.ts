import {
    markApplyingUpdate,
    markFirstControl,
    markServiceWorkerError,
    markServiceWorkerReady,
    markUpdateAvailable,
} from './pwa-store';

const BASE_URL = import.meta.env.BASE_URL;
const SW_URL = `${BASE_URL}sw.js`;

let started = false;
let registration: ServiceWorkerRegistration | null = null;
let applyRequested = false;
let reloading = false;
let controlledAtStart = false;

const requestReload = () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
};

let firstControlAnnounced = false;

const waitForController = (timeoutMs = 10_000) =>
    new Promise<boolean>((resolve) => {
        if (navigator.serviceWorker.controller) {
            resolve(true);
            return;
        }

        const finish = (controlled: boolean) => {
            navigator.serviceWorker.removeEventListener('controllerchange', onChange);
            window.clearTimeout(timer);
            resolve(controlled);
        };
        const onChange = () => {
            if (navigator.serviceWorker.controller) finish(true);
        };
        const timer = window.setTimeout(() => finish(Boolean(navigator.serviceWorker.controller)), timeoutMs);

        navigator.serviceWorker.addEventListener('controllerchange', onChange);
    });

/**
 * Dispatched exactly once when the page that started before service worker
 * installation becomes controlled. Pages that were already controlled at
 * startup do not need to refetch: their requests go through the worker.
 */
function announceFirstControl() {
    if (firstControlAnnounced || controlledAtStart) return;
    if (!navigator.serviceWorker.controller) return;
    firstControlAnnounced = true;
    markFirstControl();
}

const watchRegistration = (nextRegistration: ServiceWorkerRegistration) => {
    if (nextRegistration.waiting) {
        if (navigator.serviceWorker.controller) {
            markUpdateAvailable();
        } else {
            // First install: there is no old version to keep serving.
            nextRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    nextRegistration.addEventListener('updatefound', () => {
        const installing = nextRegistration.installing;
        if (!installing) return;

        installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                markUpdateAvailable();
            }
        });
    });
};

/**
 * Registers the generated service worker. Update checks run periodically and
 * whenever the app comes back online or becomes visible again. A waiting
 * worker is never activated until the user confirms the update prompt.
 */
export async function registerServiceWorker() {
    if (started) return;
    started = true;

    if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;

    controlledAtStart = Boolean(navigator.serviceWorker.controller);

    try {
        const nextRegistration = await navigator.serviceWorker.register(SW_URL, { scope: BASE_URL });
        registration = nextRegistration;
        markServiceWorkerReady();
        watchRegistration(nextRegistration);

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (applyRequested) requestReload();
            announceFirstControl();
        });

        // The first page load happens before the worker is installed, so its
        // API responses never pass through the worker and are not cached. Once
        // the freshly installed worker claims this page, tell the application
        // to refetch active queries so their responses land in the API cache.
        void (async () => {
            await navigator.serviceWorker.ready;
            const controlled = await waitForController();
            if (controlled) announceFirstControl();
        })();

        const check = () => {
            void nextRegistration.update().catch(() => undefined);
        };

        window.setInterval(check, 30 * 60 * 1000);
        window.addEventListener('online', check);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') check();
        });
    } catch (error) {
        markServiceWorkerError(error instanceof Error ? error.message : 'Service worker registration failed.');
    }
}

export async function checkForServiceWorkerUpdate() {
    if (!registration) return;
    try {
        await registration.update();
        if (registration.waiting && navigator.serviceWorker.controller) {
            markUpdateAvailable();
        }
    } catch {
        // A failed update check must never break the running application.
    }
}

/**
 * Activates the waiting worker (`skipWaiting`) and reloads once the new worker
 * takes control. All caches from the previous version are removed during the
 * worker's activate event, so a manual storage reset is never required.
 */
export function applyServiceWorkerUpdate() {
    markApplyingUpdate();
    applyRequested = true;

    if (!registration?.waiting) {
        requestReload();
        return;
    }

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Safety net for browsers that do not fire controllerchange promptly.
    window.setTimeout(() => {
        if (!reloading) requestReload();
    }, 5000);
}

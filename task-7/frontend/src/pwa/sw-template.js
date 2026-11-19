/**
 * Orbital Mission Control service worker.
 * This file is a template. `vite.config.ts` injects the build version, the
 * public base path, the API origin and the precache manifest during build.
 *
 * Lifecycle:
 *   install  -> precache the application shell
 *   activate -> delete caches from previous versions and claim clients
 *   fetch    -> navigation / static asset / API routing
 *
 * Updates are intentionally NOT activated automatically. The page detects a
 * waiting worker, shows an update prompt and posts SKIP_WAITING when the user
 * chooses to activate it.
 */

const VERSION = '__CACHE_VERSION__';
const BASE_PATH = '__BASE_PATH__';
const API_ORIGIN = '__API_ORIGIN__';
const PRECACHE_URLS = __PRECACHE_URLS__;

const CACHE_PREFIX = 'orbital-';
const STATIC_CACHE = `${CACHE_PREFIX}static-${VERSION}`;
const PAGES_CACHE = `${CACHE_PREFIX}pages-${VERSION}`;
const API_CACHE = `${CACHE_PREFIX}api-${VERSION}`;
const ASSET_CACHE = `${CACHE_PREFIX}assets-${VERSION}`;

const ACTIVE_CACHES = new Set([STATIC_CACHE, PAGES_CACHE, API_CACHE, ASSET_CACHE]);

const OFFLINE_URL = `${BASE_PATH}offline.html`;
const APP_SHELL_URL = `${BASE_PATH}index.html`;

const API_MAX_ENTRIES = 60;
const API_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PAGES_MAX_ENTRIES = 20;
const PAGES_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const ASSET_MAX_ENTRIES = 60;
const ASSET_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const NAVIGATION_TIMEOUT_MS = 4000;
const API_TIMEOUT_MS = 7000;

const APP_ROUTES = [
    /^\/?$/,
    /^\/about\/?$/,
    /^\/missions\/?$/,
    /^\/missions\/[^/]+\/?$/,
    /^\/dashboard\/?$/,
    /^\/login\/?$/,
    /^\/signup\/?$/,
    /^\/register\/?$/,
    /^\/account\/?$/,
    /^\/profile\/?$/,
    /^\/offline\/?$/,
    /^\/not-found\/?$/,
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const withTimeout = (promise, timeoutMs) =>
    new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Service worker request timed out')), timeoutMs);
        promise.then(
            (value) => {
                clearTimeout(timeout);
                resolve(value);
            },
            (error) => {
                clearTimeout(timeout);
                reject(error);
            },
        );
    });

const stripBasePath = (pathname) => {
    if (!BASE_PATH || BASE_PATH === '/') return pathname;
    const base = BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH;
    return pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
};

const isAppRoute = (pathname) => {
    const route = stripBasePath(pathname);
    return APP_ROUTES.some((pattern) => pattern.test(route));
};

const isSameOrigin = (url) => url.origin === self.location.origin;

const isApiRequest = (url) => url.pathname.startsWith('/api/') && (url.origin === API_ORIGIN || isSameOrigin(url));

const isPublicMissionRequest = (url) =>
    (url.pathname === '/api/missions' || url.pathname.startsWith('/api/missions/') || url.pathname === '/api/health') &&
    (url.origin === API_ORIGIN || isSameOrigin(url));

const isPrivateApiRequest = (url) => url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/api/private');

const isCacheableResponse = (response, { allowNoStore = false } = {}) => {
    if (!response || !response.ok) return false;
    const cacheControl = response.headers.get('Cache-Control') || '';
    if (/(^|[\s,])private([\s,]|$)/i.test(cacheControl)) return false;
    // Spring sends `no-store` for every API response. Public mission list and
    // detail responses are still safe to keep offline; private endpoints never
    // reach the API cache (see fetch routing).
    if (!allowNoStore && /no-store/i.test(cacheControl)) return false;
    return true;
};

const copyHeaders = (response, extraHeaders = {}) => {
    const headers = new Headers(response.headers);
    // The browser has already decoded the body; forwarding these headers on a
    // synthetic Response can trigger decoding errors.
    ['content-encoding', 'content-length', 'transfer-encoding', 'connection'].forEach((name) => headers.delete(name));
    Object.entries(extraHeaders).forEach(([key, value]) => headers.set(key, value));
    return headers;
};

const timestampHeaders = (response, cachedAt = Date.now()) =>
    copyHeaders(response, { 'x-pwa-cached-at': String(cachedAt) });

const cloneWithHeaders = async (response, extraHeaders) => {
    const body = await response.clone().blob();
    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: copyHeaders(response, extraHeaders),
    });
};

const offlineApiResponse = () =>
    new Response(
        JSON.stringify({
            status: 503,
            message: 'You are offline and this response is not available in the cache yet.',
        }),
        {
            status: 503,
            statusText: 'Offline',
            headers: {
                'Content-Type': 'application/json',
                'X-PWA-Offline': '1',
            },
        },
    );

const offlineImageResponse = () =>
    new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#111820"/><path d="M32 16l3 12 12 4-12 4-3 12-3-12-12-4 12-4z" fill="#405467"/></svg>',
        {
            status: 200,
            headers: { 'Content-Type': 'image/svg+xml', 'X-PWA-Offline': '1' },
        },
    );

/**
 * Remove expired entries and enforce a maximum number of entries. Cache API
 * keys are returned in insertion order, so the oldest entries are removed
 * first when a cache exceeds its budget.
 */
async function trimCache(cacheName, maxEntries, maxAgeMs) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const now = Date.now();

    if (maxAgeMs) {
        for (const key of keys) {
            const response = await cache.match(key);
            const cachedAt = Number(response?.headers.get('x-pwa-cached-at') || 0);
            if (cachedAt && now - cachedAt > maxAgeMs) {
                await cache.delete(key);
            }
        }
    }

    const remaining = await cache.keys();
    const overflow = remaining.length - maxEntries;
    if (overflow > 0) {
        await Promise.all(remaining.slice(0, overflow).map((key) => cache.delete(key)));
    }
}

async function putWithTimestamp(cacheName, request, response) {
    const cache = await caches.open(cacheName);
    const body = await response.clone().blob();
    await cache.put(
        request,
        new Response(body, {
            status: response.status,
            statusText: response.statusText,
            headers: timestampHeaders(response),
        }),
    );
}

/* -------------------------------------------------------------------------- */
/* Install                                                                    */
/* -------------------------------------------------------------------------- */

self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(STATIC_CACHE);
            await cache.addAll(PRECACHE_URLS);
        })(),
    );
});

/* -------------------------------------------------------------------------- */
/* Activate                                                                   */
/* -------------------------------------------------------------------------- */

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter((name) => name.startsWith(CACHE_PREFIX) && !ACTIVE_CACHES.has(name))
                    .map((name) => caches.delete(name)),
            );

            if (self.registration.navigationPreload) {
                try {
                    await self.registration.navigationPreload.enable();
                } catch {
                    // Navigation preload is optional.
                }
            }

            await self.clients.claim();

            const clients = await self.clients.matchAll({ type: 'window' });
            clients.forEach((client) => client.postMessage({ type: 'SW_ACTIVATED', version: VERSION }));
        })(),
    );
});

self.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (data.type === 'GET_VERSION' && event.source) {
        event.source.postMessage({ type: 'SW_VERSION', version: VERSION });
    }
});

/* -------------------------------------------------------------------------- */
/* Fetch routing                                                              */
/* -------------------------------------------------------------------------- */

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    let url;
    try {
        url = new URL(request.url);
    } catch {
        return;
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(event));
        return;
    }

    if (isApiRequest(url)) {
        if (isPrivateApiRequest(url)) return;
        if (!isPublicMissionRequest(url)) return;
        event.respondWith(handleApiRequest(request));
        return;
    }

    if (
        isSameOrigin(url) ||
        request.destination === 'font' ||
        request.destination === 'image' ||
        request.destination === 'style'
    ) {
        event.respondWith(handleStaticRequest(request));
    }
});

/* -------------------------------------------------------------------------- */
/* Navigation: network-first, then exact cached page, then app shell, then    */
/* the dedicated offline page.                                                */
/* -------------------------------------------------------------------------- */

async function handleNavigation(event) {
    const request = event.request;
    const url = new URL(request.url);

    try {
        let preloadResponse = null;
        try {
            if (event.preloadResponse) {
                preloadResponse = await withTimeout(event.preloadResponse, NAVIGATION_TIMEOUT_MS);
            }
        } catch {
            preloadResponse = null;
        }

        const response = preloadResponse || (await withTimeout(fetch(request), NAVIGATION_TIMEOUT_MS));

        if (isCacheableResponse(response)) {
            try {
                await putWithTimestamp(PAGES_CACHE, request, response.clone());
                await trimCache(PAGES_CACHE, PAGES_MAX_ENTRIES, PAGES_MAX_AGE_MS);
            } catch {
                // Caching failures must not hide a successful navigation.
            }
        }
        return response;
    } catch {
        // Offline or slow network: try the exact URL first so previously
        // visited routes keep their navigation response.
        const pages = await caches.open(PAGES_CACHE);
        const cachedPage = await pages.match(request, { ignoreSearch: false, ignoreVary: true });
        if (cachedPage) {
            const cachedAt = Number(cachedPage.headers.get('x-pwa-cached-at') || 0);
            if (!cachedAt || Date.now() - cachedAt < PAGES_MAX_AGE_MS) {
                return cloneWithHeaders(cachedPage, { 'X-PWA-Cache': 'hit' });
            }
            await pages.delete(request);
        }

        // Client-side routed app URLs can boot from the precached shell. All
        // lazy JS/CSS chunks are precached, so any app route works offline.
        if (isAppRoute(url.pathname)) {
            const shell = await caches.match(APP_SHELL_URL, { cacheName: STATIC_CACHE, ignoreVary: true });
            if (shell) {
                return cloneWithHeaders(shell, { 'X-PWA-Cache': 'shell' });
            }
        }

        // Navigation cannot be completed: serve the dedicated offline page.
        const offlinePage = await caches.match(OFFLINE_URL, { cacheName: STATIC_CACHE, ignoreVary: true });
        if (offlinePage) {
            return cloneWithHeaders(offlinePage, { 'X-PWA-Offline': '1' });
        }

        return new Response(
            '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0f14;color:#e8edf2;font-family:system-ui,sans-serif"><main style="padding:32px;text-align:center"><h1>You are offline</h1><p>Reconnect to continue.</p><button onclick="location.reload()" style="min-height:48px;padding:12px 18px">Retry connection</button></main></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-PWA-Offline': '1' } },
        );
    }
}

// Navigation preload responses arrive on the fetch event. When the browser
// does not support them, the regular network request is the safe fallback.

/* -------------------------------------------------------------------------- */
/* API: network-first with cache fallback and cache freshness metadata.       */
/* -------------------------------------------------------------------------- */

async function handleApiRequest(request) {
    try {
        const response = await withTimeout(fetch(request), API_TIMEOUT_MS);
        const cacheable = isCacheableResponse(response, { allowNoStore: true });
        if (cacheable) {
            try {
                await putWithTimestamp(API_CACHE, request, response.clone());
                await trimCache(API_CACHE, API_MAX_ENTRIES, API_MAX_AGE_MS);
            } catch {
                // Ignore quota/storage failures; the live response still wins.
            }
        }
        return response;
    } catch {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(request, { ignoreVary: true });
        if (cached) {
            const cachedAt = Number(cached.headers.get('x-pwa-cached-at') || 0);
            const age = cachedAt ? Date.now() - cachedAt : 0;
            if (!cachedAt || age < API_MAX_AGE_MS) {
                return cloneWithHeaders(cached, {
                    'X-PWA-Cache': 'hit',
                    'X-PWA-Cache-Age': String(Math.max(0, Math.round(age / 1000))),
                });
            }
            await cache.delete(request);
        }
        return offlineApiResponse();
    }
}

/* -------------------------------------------------------------------------- */
/* Static assets: cache-first with a bounded runtime cache for images/fonts.  */
/* -------------------------------------------------------------------------- */

async function handleStaticRequest(request) {
    const cached = await caches.match(request, { cacheName: STATIC_CACHE, ignoreVary: true });
    if (cached) return cached;

    const runtimeCached = await caches.match(request, { cacheName: ASSET_CACHE, ignoreVary: true });
    if (runtimeCached) {
        const cachedAt = Number(runtimeCached.headers.get('x-pwa-cached-at') || 0);
        if (!cachedAt || Date.now() - cachedAt < ASSET_MAX_AGE_MS) {
            return runtimeCached;
        }
        const cache = await caches.open(ASSET_CACHE);
        await cache.delete(request);
    }

    try {
        const response = await fetch(request);
        if (isCacheableResponse(response)) {
            try {
                await putWithTimestamp(ASSET_CACHE, request, response.clone());
                await trimCache(ASSET_CACHE, ASSET_MAX_ENTRIES, ASSET_MAX_AGE_MS);
            } catch {
                // Ignore runtime cache failures.
            }
        }
        return response;
    } catch {
        if (request.destination === 'image') return offlineImageResponse();
        if (request.destination === 'font') {
            return new Response('', { status: 504, statusText: 'Font unavailable offline' });
        }
        return new Response('', { status: 504, statusText: 'Asset unavailable offline' });
    }
}

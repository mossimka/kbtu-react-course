import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, loadEnv } from 'vite';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiOrigin = new URL(env.VITE_API_URL ?? 'http://localhost:8080').origin;

    // Workbox serializes runtimeCaching matchers into the generated service
    // worker, so the API origin must be embedded in the RegExp instead of
    // captured from this module's scope.
    const apiPattern = new RegExp(`^${escapeRegExp(apiOrigin)}(/|$)`);

    return {
        plugins: [
            react(),
            VitePWA({
                registerType: 'prompt',
                manifest: false,
                workbox: {
                    globPatterns: ['**/*.{js,css,html,png,svg,json}'],
                    // The precached shell is served for navigation requests, so
                    // the app can boot offline. `OfflineShell` then switches the
                    // app to /offline.
                    navigateFallback: 'index.html',
                    cleanupOutdatedCaches: true,
                    clientsClaim: true,
                    runtimeCaching: [
                        {
                            urlPattern: ({ request }) => ['image', 'font', 'style'].includes(request.destination),
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'static-assets',
                                expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
                                cacheableResponse: { statuses: [0, 200] },
                            },
                        },
                        {
                            urlPattern: apiPattern,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'api',
                                networkTimeoutSeconds: 5,
                                expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
                                cacheableResponse: { statuses: [200] },
                            },
                        },
                    ],
                },
            }),
        ],
        base: env.VITE_BASE_PATH ?? '/',
    };
});

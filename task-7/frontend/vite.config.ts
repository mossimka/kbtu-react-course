import react from '@vitejs/plugin-react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const PACKAGE_ROOT = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_DIR = join(PACKAGE_ROOT, 'public');
const SW_TEMPLATE = join(PACKAGE_ROOT, 'src/pwa/sw-template.js');

const collectPublicFiles = (directory: string, root = directory): string[] => {
    if (!statSync(directory, { throwIfNoEntry: false })) return [];

    return readdirSync(directory).flatMap((entry) => {
        const absolutePath = join(directory, entry);
        const stats = statSync(absolutePath);

        if (stats.isDirectory()) return collectPublicFiles(absolutePath, root);
        return [relative(root, absolutePath).split(sep).join('/')];
    });
};

const normalizeBase = (base: string) => (base.endsWith('/') ? base : `${base}/`);

/**
 * Generates `dist/sw.js` from the service-worker template. The generated file
 * contains a versioned cache identifier and a complete precache manifest of
 * the built HTML, JS, CSS, icons and the offline page.
 */
const orbitalPwa = (): Plugin => {
    let basePath = '/';

    return {
        name: 'orbital-pwa',
        apply: 'build',
        configResolved(config) {
            basePath = config.base;
        },
        generateBundle(_options, bundle) {
            const base = normalizeBase(basePath);
            const apiOrigin = new URL(process.env.VITE_API_URL ?? 'http://localhost:8080').origin;
            const version = process.env.VITE_BUILD_ID ?? `${Date.now()}`;

            const precache = new Set<string>([
                base,
                `${base}index.html`,
                `${base}offline.html`,
                `${base}manifest.json`,
            ]);

            Object.keys(bundle)
                .filter((fileName) => !fileName.endsWith('.map') && fileName !== 'sw.js')
                .forEach((fileName) => precache.add(`${base}${fileName}`));

            collectPublicFiles(PUBLIC_DIR).forEach((fileName) => precache.add(`${base}${fileName}`));

            const generated = readFileSync(SW_TEMPLATE, 'utf8')
                .replaceAll('__CACHE_VERSION__', version)
                .replaceAll('__BASE_PATH__', base)
                .replaceAll('__API_ORIGIN__', apiOrigin)
                .replace('__PRECACHE_URLS__', JSON.stringify([...precache], null, 4));

            this.emitFile({
                type: 'asset',
                fileName: 'sw.js',
                source: generated,
            });
        },
    };
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), orbitalPwa()],
    base: process.env.VITE_BASE_PATH ?? '/',
});

# Mission Control

Task 7 is an installable React + TypeScript PWA backed by a Spring Boot API. The frontend keeps the existing
mission search, filters, sorting, pagination, dashboard, CRUD and Firebase Authentication flows, and adds a
versioned service worker, runtime caching, an offline page and a responsive mobile interface.

Repository: https://github.com/mossimka/kbtu-react-course

Deployed application: https://mossimka.github.io/kbtu-react-course/

## Features

- Firebase Email/Password and Google sign-in
- Persistent Firebase sessions with protected `/profile` and `/missions/new` routes
- Searchable, filterable, sortable, paginated mission manifest
- Mission create, edit, status update, and delete operations
- Loading, error, empty, and success states
- TanStack Query mission-page cache with query-based keys and invalidation
- Installable PWA with versioned service worker, update prompt and old-cache cleanup
- Offline app shell, visited routes, cached public mission data and a dedicated `/offline` page
- Responsive layout and mobile navigation from 320px in portrait and landscape

## Setup

Copy `.env.example` to `frontend/.env.local`, then fill in the Firebase Web App values from the Firebase
console:

```powershell
Copy-Item .env.example frontend\.env.local
```

In Firebase Authentication, enable **Email/Password** and **Google** providers. Start the frontend with:

```powershell
cd frontend
npm install
npm run dev
```

Start the backend separately from `backend`, or use:

```powershell
docker compose up --build
```

## Environment variables

`frontend/.env.local` uses Vite variables:

- `VITE_API_URL` - Spring API origin
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Never commit `.env.local`. Firebase browser configuration values are intended for client-side use, but Firebase
provider and database security rules must still be configured in the Firebase console.

## Caching strategy

Mission list requests use TanStack Query through the shared `QueryClient`. Each query is keyed by the complete
query object (search, filters, sort, page, and page size), stays fresh for 30 seconds, and is garbage-collected
after five minutes. TanStack Query passes an `AbortSignal` to the API request when the query changes, so an older
response cannot overwrite newer results. Creating, updating, changing status, or deleting a mission invalidates
the `missions` query family, ensuring the next read uses fresh server data.

## PWA and offline support

The frontend is an installable PWA. `frontend/public/manifest.json` defines the app identity, relative
`start_url`/`scope`, standalone display, colors and 192px/512px regular and maskable icons. The manifest is
linked from `index.html`.

The manual service worker is generated at build time from `frontend/src/pwa/sw-template.js`. The Vite plugin in
`frontend/vite.config.ts` injects the build version, base path, API origin and a complete precache manifest that
includes the app shell, every lazy JS chunk, every CSS file, icons, the manifest and `offline.html`.

- **install** precaches the app shell and hashed assets.
- **activate** deletes previous `orbital-*` cache versions, enables navigation preload and claims pages.
- **fetch** uses network-first for navigations and public mission APIs, and cache-first for static assets.

Caches are bounded: API responses 60 entries / 24 hours, visited pages 20 entries / 7 days, runtime assets
60 entries / 30 days. Expired entries and overflow are removed. Public mission list/detail responses are cached;
`/api/auth*`, `/api/private*`, non-GET requests and any request with an `Authorization` header are never cached.

Cached responses carry `X-PWA-Cache`, `X-PWA-Cache-Age` and `X-PWA-Offline` headers. The UI shows a **SAVED
DATA** banner with the cache age instead of pretending cached data is live. Navigations that cannot be resolved
offline reach `offline.html`, while known app routes boot from the precached shell. The React `/offline` page
shows the connection state, a retry button, cache age and links back to cached pages, and reloads when the
connection returns.

New service worker versions wait until the user presses **RELOAD & UPDATE**. Activation then removes old caches
and the page reloads once with the new build.

The layout is tested from 320px wide in portrait and landscape: the navigation collapses into an accessible
hamburger menu, nav links use 48px touch targets, and cards, filters, forms, pagination, dashboard grids, tables
and detail pages reflow without horizontal scrolling.

See `frontend/README.md` for the full PWA architecture, deployment and manual verification checklist.

## Deployment

- Frontend: GitHub Pages at https://mossimka.github.io/kbtu-react-course/
- Backend: Render Web Service at https://kbtu-react-course.onrender.com

GitHub Pages serves `docs/` from the `main` branch. Build the frontend with the repository sub-path and the
production API:

```bash
cd frontend
VITE_BASE_PATH=/kbtu-react-course/ \
VITE_API_URL=https://kbtu-react-course.onrender.com \
npm run build
rm -rf ../../docs
cp -r dist ../../docs
cp ../../docs/index.html ../../docs/404.html
```

`404.html` makes deep links such as `/kbtu-react-course/missions/1` load the SPA on GitHub Pages. The backend
allows the Pages origin through `CORS_ALWAYS_ALLOWED_ORIGIN_PATTERNS` and the optional
`CORS_ALLOWED_ORIGIN_PATTERNS` environment variable.

Firebase configuration is optional at build time. Without `VITE_FIREBASE_*` values the app falls back to the
backend token endpoints for email/password registration and sign-in, while public mission data, dashboard,
filters, CRUD and offline mode remain fully usable. Google sign-in requires Firebase.

The backend defaults to `spring.jpa.hibernate.ddl-auto=update`, so a fresh managed Postgres database gains the
`missions`, `app_users` and `auth_tokens` tables without manual SQL. Override it with
`SPRING_JPA_HIBERNATE_DDL_AUTO` when a deployment uses explicit migrations.

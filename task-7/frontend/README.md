# Orbital Mission Control

React + TypeScript frontend for the Mission Control midterm project. It consumes the Spring Boot API in
`../backend` and provides a routed, searchable, filterable, sortable and paginated mission manifest with a
live analytics dashboard.

- Repository: [https://github.com/mossimka/kbtu-react-course](https://github.com/mossimka/kbtu-react-course)
- Deployed application: [https://mossimka.github.io/kbtu-react-course/](https://mossimka.github.io/kbtu-react-course/)

## Features

- Installable PWA with a web app manifest, maskable icons and a standalone display mode
- Versioned service worker with precaching, update prompt and old-cache cleanup
- Offline support for the app shell, visited routes and public mission list/detail data
- Dedicated `/offline` page with connection retry and restore/reload handling
- Client-side routing with nested routes and a shared layout
- Lazy-loaded pages with a `Suspense` loading fallback
- Home, About, Missions, Mission details, Create mission, Dashboard, Login, Register, Profile and 404 pages
- Firebase Email/Password and Google authentication with persistent sessions
- Protected mission creation/editing and a private account page
- Search by mission name, destination and mission type
- Status and priority filters stored in the URL
- Server-side sorting and pagination
- Mission list, detail, create and edit views
- Status updates and deletion
- Dashboard statistics and breakdowns calculated from live API data
- Loading, error, empty, and success states
- Responsive dark mission-control interface from 320px through desktop
- Accessible mobile navigation with a hamburger menu and 48px touch targets

## Routes

| Route             | Page            | Description                                     |
| ----------------- | --------------- | ----------------------------------------------- |
| `/`             | Home            | Project introduction and entry points           |
| `/about`        | About           | Project, stack and API information              |
| `/missions`     | Missions        | Searchable, filterable, sorted mission manifest |
| `/missions/new` | Create mission  | Protected — requires an authenticated session  |
| `/missions/:id` | Mission details | Dynamic record loaded by route parameter        |
| `/dashboard`    | Dashboard       | Live statistics, breakdowns and filters         |
| `/login`        | Login           | Email/password sign-in                          |
| `/register`     | Register        | Create an operator account                      |
| `/profile`      | Profile         | Protected Firebase profile and sign-out         |
| `/offline`      | Offline         | Connection status, retry and cached-data entry  |
| `*`             | Not found       | Custom 404 page                                 |

Mission filters are synchronized with the query string, for example:

```text
/missions?search=mars&status=active&priority=high&sortBy=name&direction=asc&page=1
```

Refreshing the page, sharing the URL, and browser Back/Forward all preserve the current filter state.

## Project structure

```text
src/
├── app/          # Router setup and route table
├── pages/        # Route-level pages (lazy loaded)
├── widgets/      # Layout, navigation, header, mission list
├── features/     # Auth context/forms/guards and mission filters
├── entities/     # Mission model, API facade and card UI
├── services/     # API, Firebase authentication and TanStack Query client
├── pwa/          # Service worker template, registration and PWA state
├── widgets/pwa/  # Connectivity banner, network indicator and update prompt
└── shared/       # Tokens, config and reusable UI states
```

## Local development

Create `frontend/.env.local` from the task-level `.env.example`:

```env
VITE_API_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

Install and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Start the Spring Boot backend from `../backend`:

```bash
cd backend
./mvnw spring-boot:run
```

Alternatively, start PostgreSQL, the API and the Vite dev server together from the task root:

```bash
docker compose up --build
```

## Environment variables

| Variable                         | Where    | Purpose                                 |
| -------------------------------- | -------- | --------------------------------------- |
| `VITE_API_URL`                 | Frontend | Base URL of the Spring API              |
| `VITE_BASE_PATH`               | Frontend | Deployment sub-path, e.g. `/kbtu-react-course/` |
| `VITE_FIREBASE_*`              | Frontend | Firebase Web App configuration          |
| `PORT`                         | Backend  | HTTP port (defaults to `8080`)        |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | Backend  | Allowed frontend origins                |
| `CORS_ALWAYS_ALLOWED_ORIGIN_PATTERNS` | Backend | Extra origins merged with the list above |
| `AUTH_TOKEN_TTL_HOURS`         | Backend  | Bearer token lifetime (default `168`) |

`VITE_API_URL` is replaced during the Vite build, so changing it requires a new deployment.

## Authentication and caching

Firebase handles Email/Password and Google sign-in, persistent sessions, loading state, and logout. The auth
provider supplies the current Firebase user through `useAuth`; protected routes redirect unauthenticated users
to `/login`.

1. `POST /api/auth/register` with `{ name, email, password }` returns a token and user profile.
2. `POST /api/auth/login` with `{ email, password }` returns a token and user profile.
3. Authenticated requests send `Authorization: Bearer <token>`.
4. `GET /api/auth/me` restores the current session on page reload.
5. `POST /api/auth/logout` revokes all tokens for the user.

Mission pages use TanStack Query with a 30-second stale time and query keys containing the complete request
parameters. Query changes cancel the previous request, and mission mutations invalidate every cached page so
stale data is not displayed after a write.

## PWA and offline support

The application is an installable PWA. `public/manifest.json` defines the name, short name, relative
`start_url`/`scope`, standalone display mode, theme/background colors, and 192px/512px regular and maskable
icons. `index.html` links the manifest, theme color and Apple touch icon.

`src/pwa/sw-template.js` is the source of truth for the service worker. During a production build,
`vite.config.ts` injects:

- a cache version derived from the build id,
- the deployment base path,
- the API origin,
- the complete precache manifest (HTML, every lazy JS chunk, every CSS file, icons, manifest and offline page).

### Lifecycle

1. **install** — precaches the application shell and all hashed assets.
2. **activate** — deletes every `orbital-*` cache whose version is not the current one, enables navigation
   preload, claims open pages, and notifies them that the worker activated.
3. **fetch** — routes requests through the strategies below.

A newly installed worker stays in the waiting state instead of activating immediately. The page detects it,
shows the **NEW VERSION AVAILABLE** prompt, and only posts `SKIP_WAITING` when the user presses
**RELOAD & UPDATE**. The following `controllerchange` reloads the page once, so the updated build and caches
are used. Old caches are removed during activation.

### Caching strategies

| Request | Strategy | Cache budget |
| --- | --- | --- |
| Navigations | Network-first with a 4s timeout; exact cached page, then precached app shell for known routes, then `offline.html` | 20 entries / 7 days |
| Public API (`/api/missions*`, `/api/health`) | Network-first with a 7s timeout and cache fallback | 60 entries / 24 hours |
| Static assets, scripts, styles, images, fonts | Cache-first from the precache, then a bounded runtime asset cache | 60 entries / 30 days |

All caches are versioned (`orbital-<name>-<version>`), entries are timestamped, expired entries are removed,
and the least recently inserted entries are evicted when a cache exceeds its budget.

The worker never handles `POST`/`PUT`/`PATCH`/`DELETE`, `/api/auth*`, `/api/private*`, or any request that
carries an `Authorization` header. Tokens, authenticated user data and private responses are therefore never
written to the cache.

Responses served from the cache include `X-PWA-Cache`, `X-PWA-Cache-Age` and `X-PWA-Offline` headers. The API
layer reads them and shows a **SAVED DATA** banner with the cache age instead of presenting stale offline data
as live.

### Offline behaviour

- Previously visited routes render from the page cache, or boot from the precached app shell.
- Cached public mission list and detail responses keep working offline and are clearly labelled as saved data.
- A navigation that cannot be served by the app (unknown route, uncached page) receives `offline.html`.
- The React `/offline` page explains the state, shows the online/offline indicator, offers **RETRY CONNECTION**,
  links to cached pages, and reloads automatically when the connection returns.
- The fixed connectivity banner offers a manual refresh and reports when the device is back online.

### Updating data on the first visit

A page loaded before the worker is installed cannot have its API responses cached. When the new worker claims
that page, the app invalidates the active TanStack queries once, refetching them through the worker so the
first visit is already available offline.

## Mobile support

The layout is tested from 320px wide in portrait and landscape:

- The navigation collapses into an accessible hamburger menu (`aria-expanded`, Escape and outside-click close,
  automatic close on route change).
- Navigation links use 48px touch targets; icon buttons are at least 44px.
- Cards, filters, forms, pagination, dashboard grids, tables and mission details reflow into a single column.
- Long values wrap, filter controls stretch to the viewport, and no route causes horizontal scrolling.
- The connectivity banner, update prompt and offline page stay readable in narrow and short landscape
  viewports.

## API

The backend exposes:

| Method     | Endpoint                      | Auth   | Description                                  |
| ---------- | ----------------------------- | ------ | -------------------------------------------- |
| `POST`   | `/api/auth/register`        | Public | Create an account and issue a token          |
| `POST`   | `/api/auth/login`           | Public | Sign in and issue a token                    |
| `GET`    | `/api/auth/me`              | Bearer | Current user profile                         |
| `POST`   | `/api/auth/logout`          | Bearer | Revoke the user's tokens                     |
| `GET`    | `/api/missions`             | Public | Paginated list with search, filters, sorting |
| `GET`    | `/api/missions/{id}`        | Public | Single mission                               |
| `POST`   | `/api/missions`             | Bearer | Create a mission                             |
| `PUT`    | `/api/missions/{id}`        | Bearer | Update a mission                             |
| `PATCH`  | `/api/missions/{id}/status` | Bearer | Update only the status                       |
| `DELETE` | `/api/missions/{id}`        | Bearer | Delete a mission                             |
| `GET`    | `/api/health`               | Public | Health check                                 |

List query parameters: `search`, `status`, `priority`, `type`, `sortBy`, `direction`, `page`, `size`.
Supported sort fields are `launchDate`, `name`, `crew` and `priority`.

All frontend requests go through `src/services/service.ts`, which normalizes backend enum values and
exposes `getMissions`, `getAllMissions`, `getMission`, `createMission`, `updateMission`,
`updateMissionStatus` and `deleteMission`.

## Documentation references

- React Router: [https://reactrouter.com/](https://reactrouter.com/)
- `useSearchParams`: [https://reactrouter.com/api/hooks/useSearchParams](https://reactrouter.com/api/hooks/useSearchParams)
- `React.lazy`: [https://react.dev/reference/react/lazy](https://react.dev/reference/react/lazy)
- `Suspense`: [https://react.dev/reference/react/Suspense](https://react.dev/reference/react/Suspense)
- Web app manifest: [https://developer.mozilla.org/docs/Web/Manifest](https://developer.mozilla.org/docs/Web/Manifest)
- Service worker API: [https://developer.mozilla.org/docs/Web/API/Service_Worker_API](https://developer.mozilla.org/docs/Web/API/Service_Worker_API)
- Cache API: [https://developer.mozilla.org/docs/Web/API/Cache](https://developer.mozilla.org/docs/Web/API/Cache)

## Deployment

The frontend is deployed to GitHub Pages at
[https://mossimka.github.io/kbtu-react-course/](https://mossimka.github.io/kbtu-react-course/) and the API runs
as a Render Web Service at `https://kbtu-react-course.onrender.com`.

### Frontend: GitHub Pages

GitHub Pages serves the repository's `main` branch from the `/docs` folder. Build with the repository sub-path
and the live API origin, then copy the build into `docs`:

```bash
cd task-6/frontend
VITE_BASE_PATH=/kbtu-react-course/ \
VITE_API_URL=https://kbtu-react-course.onrender.com \
npm run build
rm -rf ../../docs
cp -r dist ../../docs
cp ../../docs/index.html ../../docs/404.html
```

`VITE_BASE_PATH` sets the Vite base, the manifest's relative `start_url`/`scope`, the React Router basename and
the service worker scope. `404.html` is a copy of `index.html`, so GitHub Pages serves the SPA for deep links
such as `/kbtu-react-course/missions/1` instead of its own 404 page.

Commit `docs/` and push to `main`. GitHub Pages republishes automatically. The service worker requires HTTPS
(or `localhost`), which GitHub Pages provides.

### Backend: Render

1. Create a **Web Service** from this repository.
2. Set the service root directory to `backend` and choose Docker as the runtime; Render uses
   `backend/Dockerfile`.
3. Add a Render PostgreSQL database and connect its values as `SPRING_DATASOURCE_URL`,
   `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`.
4. Configure the health check path as `/api/health`.
5. Allow the Pages origin through CORS. The default
   `CORS_ALWAYS_ALLOWED_ORIGIN_PATTERNS` already contains `https://mossimka.github.io`, and it is merged with
   `CORS_ALLOWED_ORIGIN_PATTERNS`, so the Pages deployment works even when the Render environment defines its
   own list:

```env
CORS_ALLOWED_ORIGIN_PATTERNS=https://mossimka.github.io
```

The Docker image listens on Render's `PORT` variable and falls back to `8080` locally.

Firebase is optional at build time. Without `VITE_FIREBASE_*` values the public mission manifest, dashboard,
filters and offline mode still work; sign-in screens explain that authentication is not configured in that
build. Set the Firebase variables at build time to enable authentication.

### PWA verification

1. Build and preview the production bundle (`npm run build && npm run preview`).
2. Open DevTools → Application → Manifest and confirm the name, icons and installability.
3. Load `/missions` twice (the first load installs the worker, the second is controlled), then open
   `/missions` and `/missions/1` to seed the page/API caches.
4. Switch DevTools to Offline and reload. The mission list and visited detail pages should render with the
   **SAVED DATA** banner; an unknown URL should show `offline.html`.
5. Visit `/offline` and confirm the retry button, status indicator and cached page links.
6. Rebuild the app, call `registration.update()` from the console, and confirm the update prompt, waiting
   worker, `RELOAD & UPDATE` activation and removal of old caches.

## Validation

```bash
cd frontend
npm run lint
npm run tsc
npm run build
```

Mobile checks are performed at 320×568 and 568×320 on `/`, `/about`, `/missions`, `/missions/1`,
`/dashboard`, `/login`, `/signup`, `/offline` and `/account`; each route must keep
`document.scrollWidth === window.innerWidth` and the hamburger menu must open, close on Escape and use touch
targets of at least 44px.

# Mission Control

Task 6 is a React + TypeScript frontend backed by a Spring Boot API. The frontend keeps the existing mission
search, filters, sorting, pagination, dashboard, and CRUD flows, and adds Firebase Authentication.

Repository: https://github.com/mossimka/kbtu-react-course

## Features

- Firebase Email/Password and Google sign-in
- Persistent Firebase sessions with protected `/profile` and `/missions/new` routes
- Searchable, filterable, sortable, paginated mission manifest
- Mission create, edit, status update, and delete operations
- Loading, error, empty, and success states
- Redux Toolkit for all server data, request lifecycles, caching, and mutations
- Service Worker caching, offline shell, and installable PWA

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

## Redux state management

The frontend uses Redux Toolkit with a single `configureStore` instance and React Redux's `Provider`. Redux is the
only owner of server data; there is no second query cache. Firebase authentication remains in `AuthContext`; Redux
does not duplicate the authenticated user or credentials.

The three feature-based slices are:

- `missions` — the mission page, list cache, request lifecycle, and create/update/status/delete operations.
- `missionDetails` — the selected mission record, not-found state, and details request lifecycle.
- `dashboard` — the full mission collection used by the analytics dashboard.

Four `createAsyncThunk` operations cover the server work: `fetchMissions` (paginated list), `fetchMissionDetails`,
`fetchDashboardMissions`, and `saveMission` (create, update, status change, delete). Each handles `pending`,
`fulfilled`, and `rejected` in `extraReducers`. A `requestId` guard ignores responses from superseded requests, and a
`condition` guard skips duplicate or still-fresh requests. After a successful mutation the list and dashboard are
refreshed, while the details view is updated from the mutation response.

Reusable selectors live next to their slices. `selectMissionSummary`, `selectDashboardTypes`,
`selectFilteredDashboardMissions`, and `selectDashboardAnalytics` are memoized with `createSelector`; plain selectors
such as `selectMissionItems` and `selectMissionMutation` are also shared. Search, filters, sorting, and pagination
remain driven by URL parameters. The search input is local state and is written to the URL after a 300 ms debounce, so
typing does not fire a request per keystroke. Temporary form and filter UI state stays local.


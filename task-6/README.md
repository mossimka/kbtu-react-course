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
- 30-second mission-page cache with query-based cache keys

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

Mission list requests are cached in `frontend/src/services/mission-cache.ts`. Each entry is keyed by the complete
query (search, filters, sort, page, and page size) and expires after 30 seconds. An `AbortController` cancels
the previous request when the URL query changes, so an older response cannot overwrite newer results. Creating,
updating, changing status, or deleting a mission clears the cache, ensuring the next read uses fresh server data.

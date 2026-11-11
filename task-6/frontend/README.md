# Orbital Mission Control

React + TypeScript frontend for the Mission Control midterm project. It consumes the Spring Boot API in
`../backend` and provides a routed, searchable, filterable, sortable and paginated mission manifest with a
live analytics dashboard.

- Repository: [https://github.com/mossimka/kbtu-react-course](https://github.com/mossimka/kbtu-react-course)
- Deployed application: _add the production URL after deployment_

## Features

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
- Loading, error, empty and success states
- Responsive dark mission-control interface

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
| `VITE_FIREBASE_*`              | Frontend | Firebase Web App configuration          |
| `PORT`                         | Backend  | HTTP port (defaults to `8080`)        |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | Backend  | Allowed frontend origins                |
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

## Validation

```bash
cd frontend
npm run lint
npm run tsc
npm run build
```

## Vercel + Render deployment

Deploy `frontend` as a Vercel project and `backend` as a Render Web Service. They are separate
deployments:

1. On Render, create a **Web Service** from this repository.
2. Set the service root directory to `backend`.
3. Choose Docker as the runtime. Render will use `backend/Dockerfile`.
4. Add a Render PostgreSQL database and connect its values to the service as
   `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and
   `SPRING_DATASOURCE_PASSWORD`.
5. Set the CORS environment variable on Render. Use the final Vercel domain:

```env
CORS_ALLOWED_ORIGIN_PATTERNS=https://mission-control.example.vercel.app
```

The Docker image listens on Render's `PORT` environment variable and falls back to port `8080` locally.
Configure the Render health check path as:

```text
/api/health
```

On Vercel, add the following project environment variable for the **Production** environment and
redeploy:

```env
VITE_API_URL=https://mission-api.example.onrender.com
```

For temporary Vercel preview deployments, multiple comma-separated patterns are supported:

```env
CORS_ALLOWED_ORIGIN_PATTERNS=https://mission-control.example.vercel.app,https://mission-control-*.vercel.app
```

Prefer a custom domain in production. If the frontend and backend are deployed under the same custom
domain, use that exact HTTPS origin and omit the preview wildcard.

Because this is a client-side routed single-page application, configure the hosting provider to rewrite
unknown paths to `index.html`. Otherwise refreshing a nested URL such as `/missions/1` or `/dashboard`
returns a server 404. Vercel does this automatically for Vite projects; other providers may need a
rewrite rule.

# Orbital Mission Control

React and TypeScript frontend for the Midterm Mission Control project. It consumes the Spring API in `../backend` and provides a searchable, filterable, sortable and paginated mission manifest.

## Features

- REST API loading with loading, error, empty and success states
- Search by mission name, destination and type
- Status and priority filters
- Server-side sorting and pagination
- Mission list and detail views
- Controlled form for creating missions
- Status updates and deletion
- Responsive dark mission-control interface

## Local development

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8080
```

```bash
cd frontend
npm install
npm run dev
```

The root `compose.yaml` starts PostgreSQL, the Spring API and the Vite development server:

```bash
docker compose up --build
```

## Production build

```bash
npm run build
```

## Vercel + Render deployment

Deploy `frontend` as a Vercel project and `backend` as a Render Web Service.
They are separate deployments:

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

The Docker image listens on Render's `PORT` environment variable and falls back
to port `8080` locally. Configure the Render health check path as:

```text
/api/health
```

On Vercel, add the following project environment variable for the **Production**
environment and redeploy:

```env
VITE_API_URL=https://mission-api.example.onrender.com
```

`VITE_API_URL` is replaced during the Vite build, so changing it requires a new
Vercel deployment. Do not use `localhost` in the Vercel environment.

For temporary Vercel preview deployments, multiple comma-separated patterns are
supported:

```env
CORS_ALLOWED_ORIGIN_PATTERNS=https://mission-control.example.vercel.app,https://mission-control-*.vercel.app
```

Prefer a custom domain in production. If the frontend and backend are deployed
under the same custom domain, use that exact HTTPS origin and omit the preview
wildcard.

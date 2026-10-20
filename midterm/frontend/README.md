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

For Vercel, set `VITE_API_URL` to the public Render URL of the Spring API, for example:

```env
VITE_API_URL=https://mission-api.example.onrender.com
```

The backend must allow the deployed Vercel origin through CORS.

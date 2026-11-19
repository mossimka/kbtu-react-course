# KBTU React Course

React + TypeScript coursework repository.

## Task 7 — Orbital Mission Control PWA

The latest task lives in [`task-7`](./task-7) and is deployed from the [`docs`](./docs) folder on
GitHub Pages.

- Repository: https://github.com/mossimka/kbtu-react-course
- Deployed application: https://mossimka.github.io/kbtu-react-course/
- API: https://kbtu-react-course.onrender.com

### Included

- Installable PWA manifest with 192×192 and 512×512 regular and maskable icons
- Versioned service worker with install/activate/fetch handling, precached app shell and old-cache cleanup
- In-app update prompt that activates a waiting worker without clearing browser storage
- Cache-first static assets and network-first public mission APIs with bounded, expiring runtime caches
- Offline support for visited routes, cached public mission data, a dedicated `/offline` page and a
  live online/offline indicator
- Responsive UI from 320px in portrait and landscape with an accessible mobile navigation menu
- All previous mission search, filters, sorting, pagination, dashboard, CRUD, protected routes and
  authentication flows, including Firebase Email/Password and Google sign-in, with a backend token fallback

See [`task-7/README.md`](./task-7/README.md) and [`task-7/frontend/README.md`](./task-7/frontend/README.md)
for setup, architecture, caching strategy and deployment details.

# V_HUNTER Frontend

This repository currently contains only the frontend application.

## Stack

- React 19
- Vite 8
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client
- globe.gl + three.js

## Project Structure

```text
v hunter/
  .gitignore
  README.md
  frontend/
    .env.example
    package.json
    vite.config.js
    src/
      components/
      pages/
      services/
```

## Setup

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Dev URL:

- `http://127.0.0.1:5173`

## Scripts

Run inside `frontend/`:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

From repository root:

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run preview
npm --prefix frontend run lint
```

## Environment Variables

`frontend/.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_API_TIMEOUT_MS=45000
```

## Routes

- `/` -> Home
- `/scanner` -> Scanner
- `/darkweb` -> Dark Web
- `/reports` -> Reports


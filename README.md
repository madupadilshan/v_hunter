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

## Home Map Backend Contract

To render real threat details on the Home page map, backend socket events must include source and target coordinates.

Supported socket events:

- `new_threat` (single event object)
- `threat_data` (array, or `{ threats: [] }`, or `{ events: [] }`)

Supported payload keys (camelCase or snake_case):

```json
{
  "id": "evt-1001",
  "startLat": 6.9271,
  "startLng": 79.8612,
  "endLat": 40.7128,
  "endLng": -74.006,
  "sourceCountry": "Sri Lanka",
  "sourceCity": "Colombo",
  "sourceIp": "203.94.12.10",
  "targetCountry": "United States",
  "targetCity": "New York",
  "targetIp": "44.192.10.10",
  "targetPort": 443,
  "protocol": "TCP",
  "threatType": "DDoS",
  "severity": "High",
  "timestamp": "2026-03-29T09:30:00Z"
}
```

Notes:

- If coordinates are missing/invalid, event is ignored (not drawn on map).
- Severity drives arc color/height when custom color is not provided.
- Map now shows only live backend events (no mock arcs).

## Routes

- `/` -> Home
- `/scanner` -> Scanner
- `/darkweb` -> Dark Web
- `/reports` -> Reports

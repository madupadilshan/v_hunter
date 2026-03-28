# V HUNTER

AI-driven vulnerability scanning and cyber threat visualization platform.

This repository contains:

- `frontend/`: React + Vite dashboard UI
- `backend/`: Flask + Socket.IO API server

## 1. Architecture

Frontend and backend run as separate services on localhost:

- Frontend dev server: `http://127.0.0.1:5173`
- Frontend preview server: `http://127.0.0.1:5174`
- Backend API + Socket server: `http://0.0.0.0:5000` (local access usually `http://127.0.0.1:5000`)

Frontend backend integration is centralized in:

- `frontend/src/services/config.js`
- `frontend/src/services/apiClient.js`
- `frontend/src/services/scannerService.js`
- `frontend/src/services/threatService.js`
- `frontend/src/services/socketService.js`
- `frontend/src/services/adapters.js`

## 2. Project Structure

```text
v hunter/
  backend/
    backend.py
    requirements.txt
  frontend/
    .env.example
    package.json
    vite.config.js
    src/
      components/
      pages/
      services/
```

## 3. Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm 9+
- Python 3.10+ (3.8+ may also work)
- pip

## 4. Setup

### 4.1 Backend setup

```bash
cd backend
pip install -r requirements.txt
python backend.py
```

### 4.2 Frontend setup

```bash
cd frontend
copy .env.example .env   # Windows PowerShell/CMD
npm install
npm run dev
```

Open:

- `http://127.0.0.1:5173`

## 5. Frontend Scripts

Run inside `frontend/`:

- `npm run dev`: Start Vite dev server on `127.0.0.1:5173`
- `npm run build`: Production build
- `npm run preview`: Preview production build on `127.0.0.1:5174`
- `npm run lint`: ESLint check

## 6. Backend Endpoints

Implemented in `backend/backend.py`.

### Health

- `GET /api/health`

### Scanning

- `POST /api/upload`
  - Content type: `multipart/form-data`
  - File field(s): `files` (and optional `file` compatibility field)

- `POST /api/scan`
  - Content type: `application/json`
  - Body:
    ```json
    { "target": "example.com" }
    ```

### Threat and vulnerability data

- `GET /api/vulnerabilities`
- `GET /api/vulnerabilities/<vuln_id>`
- `GET /api/threats/top`

## 7. Socket.IO Events

### Client -> Server

- `request_threat_data`

### Server -> Client

- `new_threat` (single threat event)
- `threat_data` (initial threat batch)

Threat payload includes:

- `startLat`, `startLng`, `endLat`, `endLng`
- `sourceCountry`, `targetCountry`
- `threatType`, `color`

## 8. Frontend Routes

- `/`: Live threat map
- `/scanner`: File/target scanner
- `/darkweb`: Dark web page (UI placeholder)
- `/reports`: Reports archive page (backend-ready empty state)

## 9. Environment Variables (Frontend)

Defined in `frontend/.env.example`:

- `VITE_API_BASE_URL` (default `http://localhost:5000`)
- `VITE_SOCKET_URL` (default `http://localhost:5000`)
- `VITE_API_TIMEOUT_MS` (default `45000`)

## 10. Common Commands from Repository Root

If you are at repository root (`v hunter/`), use:

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run preview
npm --prefix frontend run lint
```

Backend:

```bash
python backend/backend.py
```

## 11. Troubleshooting

### `ENOENT package.json`

You are running npm in the wrong folder.  
Either:

- `cd frontend` then run npm scripts, or
- use `npm --prefix frontend run <script>` from root.

### `vite preview` permission error (`EACCES`)

This project is already configured to use:

- dev: `127.0.0.1:5173`
- preview: `127.0.0.1:5174`

If your machine blocks those ports, change `frontend/vite.config.js`.

### Backend not reachable

- Ensure backend is running on port `5000`
- Check local firewall/antivirus restrictions
- Verify `.env` values in `frontend/`

## 12. Current Status

- Frontend and backend run independently.
- Scanner and threat map are wired to backend service endpoints/events.
- Reports page has no mock report entries and is ready for backend data integration.

# v_hunter

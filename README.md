# V_HUNTER Frontend

This repository is frontend-only.  
The UI was kept unchanged while the integration layer was refactored so backend teams can connect quickly.

## Stack

- React 19
- Vite 8
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client
- globe.gl + three.js

## Run

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Dev URL: `http://127.0.0.1:5173`

## Scripts

Run inside `frontend/`:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

From repo root:

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run preview
npm --prefix frontend run lint
```

## Integration Architecture

All backend integration is centralized in `frontend/src/services`:

- `config.js` -> base URL + timeout
- `contracts.js` -> all API paths + socket event names
- `apiClient.js` -> axios instance
- `errors.js` -> unified backend error message extraction
- `adapters.js` -> payload normalization (snake_case/camelCase tolerant)
- `threatService.js` -> home page threat APIs
- `socketService.js` -> live threat socket feed
- `scannerService.js` -> scanner upload/network endpoints
- `reportService.js` -> reports archive endpoint
- `darkWebService.js` -> dark web stats endpoint

Pages now consume services only; endpoint strings are not scattered across UI files.

## Environment Variables

`frontend/.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_API_TIMEOUT_MS=45000

VITE_API_PATH_TOP_THREATS=/api/threats/top
VITE_API_PATH_VULNERABILITIES=/api/vulnerabilities
VITE_API_PATH_UPLOAD_SCAN=/api/upload
VITE_API_PATH_NETWORK_SCAN=/api/scan
VITE_API_PATH_REPORTS=/api/reports
VITE_API_PATH_DARKWEB_STATS=/api/darkweb/stats

VITE_SOCKET_EVENT_REQUEST_THREATS=request_threat_data
VITE_SOCKET_EVENT_THREAT=new_threat
VITE_SOCKET_EVENT_THREAT_BATCH=threat_data
```

If backend routes/events differ, change these values only; no UI code changes needed.

## API Contracts

### 1) Home page summary APIs

- `GET {VITE_API_PATH_TOP_THREATS}`
- `GET {VITE_API_PATH_VULNERABILITIES}`

Accepted shapes:

```json
{
  "threats": [
    { "country": "Sri Lanka", "ips": 124, "percentage": 22.3 }
  ]
}
```

```json
{
  "vulnerabilities": [
    {
      "id": "v1",
      "name": "SQL Injection",
      "severity": "Critical",
      "description": "Unsanitized query",
      "cvss": 9.1,
      "count": 2
    }
  ]
}
```

### 2) Home page live socket feed

Socket URL: `VITE_SOCKET_URL`

- emit on connect: `VITE_SOCKET_EVENT_REQUEST_THREATS`
- listen single event: `VITE_SOCKET_EVENT_THREAT`
- listen batch event: `VITE_SOCKET_EVENT_THREAT_BATCH`

Batch payloads supported:

- `ThreatEvent[]`
- `{ "threats": ThreatEvent[] }`
- `{ "events": ThreatEvent[] }`

Threat event (recommended):

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
  "threatType": "DDoS",
  "severity": "High",
  "timestamp": "2026-03-29T09:30:00Z"
}
```

Notes:

- `snake_case` and `camelCase` are both accepted by adapters.
- If coordinates are missing/invalid, event is ignored (map safety).

### 3) Scanner page APIs

- `POST {VITE_API_PATH_UPLOAD_SCAN}` (`multipart/form-data`)
- `POST {VITE_API_PATH_NETWORK_SCAN}` (`application/json` body `{ "target": "..." }`)

Accepted response shapes:

- `[{ ...vulnerability }]`
- `{ "vulnerabilities": [{ ...vulnerability }] }`
- `{ "threats": [{ ...threat-like item }] }`

Vulnerability fields expected:

```json
{
  "id": "v2",
  "name": "Open Redirect",
  "severity": "Medium",
  "description": "Unsafe redirect parameter",
  "cvss": 5.4
}
```

### 4) Reports page API

- `GET {VITE_API_PATH_REPORTS}`

Accepted response shapes:

- `[{ ...report }]`
- `{ "reports": [{ ...report }] }`
- `{ "items": [{ ...report }] }`

Recommended report payload:

```json
{
  "id": "r-001",
  "name": "Weekly External Scan",
  "scannedAt": "2026-03-28T18:10:00Z",
  "severity": "High",
  "vulnerabilities_count": 12,
  "formats": ["PDF", "JSON"]
}
```

### 5) Dark Web page stats API

- `GET {VITE_API_PATH_DARKWEB_STATS}`

Recommended payload:

```json
{
  "activeThreats": 847,
  "leakedCredentials": 12500,
  "forumsMonitored": 42
}
```

## Error Handling

All pages now use shared error extraction (`services/errors.js`):

- prefers `response.data.error`
- then `response.data.message`
- then generic fallback

This gives consistent backend error display across all pages.

## Routes

- `/` -> Home
- `/scanner` -> Scanner
- `/darkweb` -> Dark Web
- `/reports` -> Reports

## Backend Engineer Quick Checklist

1. Set `VITE_API_BASE_URL` and `VITE_SOCKET_URL` in frontend `.env`.
2. Keep default paths/events OR override in `.env`.
3. Return payloads in any of the supported adapter shapes.
4. Ensure threat events include valid coordinates.
5. Verify with:
   - Home map receives socket events
   - Scanner returns normalized vulnerabilities
   - Reports endpoint returns list
   - Dark web stats endpoint returns counts

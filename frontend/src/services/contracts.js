function readPathEnv(name, fallback) {
  const value = import.meta.env[name];
  if (typeof value !== 'string') return fallback;

  const trimmed = value.trim();
  if (!trimmed) return fallback;

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function readEventEnv(name, fallback) {
  const value = import.meta.env[name];
  if (typeof value !== 'string') return fallback;

  const trimmed = value.trim();
  return trimmed || fallback;
}

export const API_PATHS = Object.freeze({
  topThreats: readPathEnv('VITE_API_PATH_TOP_THREATS', '/api/threats/top'),
  vulnerabilities: readPathEnv('VITE_API_PATH_VULNERABILITIES', '/api/vulnerabilities'),
  uploadScan: readPathEnv('VITE_API_PATH_UPLOAD_SCAN', '/api/upload'),
  networkScan: readPathEnv('VITE_API_PATH_NETWORK_SCAN', '/api/scan'),
  reports: readPathEnv('VITE_API_PATH_REPORTS', '/api/reports'),
  darkWebStats: readPathEnv('VITE_API_PATH_DARKWEB_STATS', '/api/darkweb/stats'),
});

export const SOCKET_EVENTS = Object.freeze({
  requestThreatData: readEventEnv('VITE_SOCKET_EVENT_REQUEST_THREATS', 'request_threat_data'),
  threat: readEventEnv('VITE_SOCKET_EVENT_THREAT', 'new_threat'),
  threatBatch: readEventEnv('VITE_SOCKET_EVENT_THREAT_BATCH', 'threat_data'),
});

export const BACKEND_CONTRACT = Object.freeze({
  threatEventVersion: '1.0',
  supportedThreatBatchShapes: ['Array<ThreatEvent>', '{ threats: ThreatEvent[] }', '{ events: ThreatEvent[] }'],
});

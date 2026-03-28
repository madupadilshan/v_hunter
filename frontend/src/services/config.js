const DEFAULT_API_BASE_URL = 'http://localhost:5000';
const DEFAULT_TIMEOUT_MS = 45000;

function parseTimeout(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

export const backendConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  socketUrl: import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  timeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
};


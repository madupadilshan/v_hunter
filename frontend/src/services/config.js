const DEFAULT_API_BASE_URL = 'http://localhost:5000';
const DEFAULT_TIMEOUT_MS = 45000;

function parseTimeout(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function normalizeBaseUrl(value, fallback) {
  const input = typeof value === 'string' ? value.trim() : '';
  if (!input) return fallback;
  return input.replace(/\/+$/, '');
}

export const backendConfig = {
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL, DEFAULT_API_BASE_URL),
  socketUrl: normalizeBaseUrl(import.meta.env.VITE_SOCKET_URL, import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL),
  timeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
};

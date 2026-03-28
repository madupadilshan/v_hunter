import { apiClient } from './apiClient';
import { normalizeSeveritySummary, normalizeTopThreats } from './adapters';

export async function fetchTopThreats() {
  const response = await apiClient.get('/api/threats/top');
  return normalizeTopThreats(response.data);
}

export async function fetchSeveritySummary() {
  const response = await apiClient.get('/api/vulnerabilities');
  return normalizeSeveritySummary(response.data);
}


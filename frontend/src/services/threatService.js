import { apiClient } from './apiClient';
import { normalizeSeveritySummary, normalizeTopThreats } from './adapters';
import { API_PATHS } from './contracts';
import { getErrorMessage } from './errors';

export async function fetchTopThreats() {
  try {
    const response = await apiClient.get(API_PATHS.topThreats);
    return normalizeTopThreats(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load top threats.'));
  }
}

export async function fetchSeveritySummary() {
  try {
    const response = await apiClient.get(API_PATHS.vulnerabilities);
    return normalizeSeveritySummary(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load vulnerability summary.'));
  }
}

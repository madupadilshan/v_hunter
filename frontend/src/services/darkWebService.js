import { apiClient } from './apiClient';
import { normalizeDarkWebStats } from './adapters';
import { API_PATHS } from './contracts';
import { getErrorMessage } from './errors';

export async function fetchDarkWebStats() {
  try {
    const response = await apiClient.get(API_PATHS.darkWebStats);
    return normalizeDarkWebStats(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load dark web statistics.'));
  }
}

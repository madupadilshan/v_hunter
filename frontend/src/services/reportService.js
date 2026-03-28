import { apiClient } from './apiClient';
import { normalizeReports } from './adapters';
import { API_PATHS } from './contracts';
import { getErrorMessage } from './errors';

export async function fetchReports() {
  try {
    const response = await apiClient.get(API_PATHS.reports);
    return normalizeReports(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load reports.'));
  }
}

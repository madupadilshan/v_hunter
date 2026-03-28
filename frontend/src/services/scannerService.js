import { apiClient } from './apiClient';
import { normalizeVulnerabilities } from './adapters';
import { API_PATHS } from './contracts';
import { getErrorMessage } from './errors';

function buildUploadFormData(files) {
  const formData = new FormData();

  files.forEach((file, idx) => {
    formData.append('files', file);

    if (idx === 0) {
      // Keep compatibility with backends that expect singular `file`.
      formData.append('file', file);
    }
  });

  return formData;
}

function normalizeScanResponse(data) {
  return {
    raw: data,
    vulnerabilities: normalizeVulnerabilities(data),
  };
}

export async function uploadAndScanFiles(files) {
  try {
    const payload = buildUploadFormData(files);
    const response = await apiClient.post(API_PATHS.uploadScan, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return normalizeScanResponse(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'File scan request failed.'));
  }
}

export async function scanTarget(target) {
  try {
    const response = await apiClient.post(API_PATHS.networkScan, { target });
    return normalizeScanResponse(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Network scan request failed.'));
  }
}

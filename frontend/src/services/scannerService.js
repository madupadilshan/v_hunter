import { apiClient } from './apiClient';
import { normalizeVulnerabilities } from './adapters';

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

export async function uploadAndScanFiles(files) {
  const payload = buildUploadFormData(files);
  const response = await apiClient.post('/api/upload', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    raw: response.data,
    vulnerabilities: normalizeVulnerabilities(response.data),
  };
}

export async function scanTarget(target) {
  const response = await apiClient.post('/api/scan', { target });

  return {
    raw: response.data,
    vulnerabilities: normalizeVulnerabilities(response.data),
  };
}


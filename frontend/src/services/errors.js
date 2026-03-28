function extractMessageFromPayload(payload) {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;

  return payload.error || payload.message || payload.detail || payload.title || '';
}

export function getErrorMessage(error, fallback = 'Request failed.') {
  const payloadMessage = extractMessageFromPayload(error?.response?.data);
  if (payloadMessage) return payloadMessage;

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function getStatusCode(error) {
  const status = Number(error?.response?.status);
  return Number.isFinite(status) ? status : null;
}

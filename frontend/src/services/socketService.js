import { io } from 'socket.io-client';
import { backendConfig } from './config';
import { SOCKET_EVENTS } from './contracts';
import { normalizeThreatEvent } from './adapters';

const SOCKET_OPTIONS = {
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttempts: 5,
  transports: ['websocket'],
  upgrade: false,
};

let socket;

function ensureSocket() {
  if (!socket) {
    socket = io(backendConfig.socketUrl, SOCKET_OPTIONS);
  }
  return socket;
}

function toThreatArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.threats)) return payload.threats;
  if (Array.isArray(payload?.events)) return payload.events;
  return [];
}

export function subscribeToThreats({ onThreat, onConnect, onDisconnect, onError }) {
  const client = ensureSocket();

  const handleConnect = () => {
    if (onConnect) onConnect();
    client.emit(SOCKET_EVENTS.requestThreatData);
  };

  const handleDisconnect = () => {
    if (onDisconnect) onDisconnect();
  };

  const handleThreat = (payload) => {
    const normalized = normalizeThreatEvent(payload);
    if (normalized && onThreat) {
      onThreat(normalized);
    }
  };

  const handleThreatBatch = (payload) => {
    const threats = toThreatArray(payload);
    threats.forEach(handleThreat);
  };

  const handleError = (error) => {
    if (onError) onError(error);
  };

  client.on('connect', handleConnect);
  client.on('disconnect', handleDisconnect);
  client.on(SOCKET_EVENTS.threat, handleThreat);
  client.on(SOCKET_EVENTS.threatBatch, handleThreatBatch);
  client.on('connect_error', handleError);
  client.on('error', handleError);

  return () => {
    client.off('connect', handleConnect);
    client.off('disconnect', handleDisconnect);
    client.off(SOCKET_EVENTS.threat, handleThreat);
    client.off(SOCKET_EVENTS.threatBatch, handleThreatBatch);
    client.off('connect_error', handleError);
    client.off('error', handleError);
  };
}

export function disconnectThreatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

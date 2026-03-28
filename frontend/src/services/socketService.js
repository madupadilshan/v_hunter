import { io } from 'socket.io-client';
import { backendConfig } from './config';
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

export function subscribeToThreats({ onThreat, onConnect, onDisconnect, onError }) {
  const client = ensureSocket();

  const handleConnect = () => {
    if (onConnect) onConnect();
    client.emit('request_threat_data');
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
    if (!Array.isArray(payload)) return;
    payload.forEach(handleThreat);
  };

  const handleError = (error) => {
    if (onError) onError(error);
  };

  client.on('connect', handleConnect);
  client.on('disconnect', handleDisconnect);
  client.on('new_threat', handleThreat);
  client.on('threat_data', handleThreatBatch);
  client.on('connect_error', handleError);
  client.on('error', handleError);

  return () => {
    client.off('connect', handleConnect);
    client.off('disconnect', handleDisconnect);
    client.off('new_threat', handleThreat);
    client.off('threat_data', handleThreatBatch);
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


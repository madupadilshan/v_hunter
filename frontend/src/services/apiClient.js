import axios from 'axios';
import { backendConfig } from './config';

export const apiClient = axios.create({
  baseURL: backendConfig.apiBaseUrl,
  timeout: backendConfig.timeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});


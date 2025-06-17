// Generic admin helpers for fetching model log data

import { getToken } from './authUtils';
import { getModelLogs } from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape of a model log record returned by the backend
export interface ModelLogRecord {
  timestamp: string;
  user_id: number;
  provider: string;
  model_name: string;
  tokens_used: number;
  latency_ms: number;
}

// Fetch recent model logs using stored JWT token
export async function fetchModelLogs() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getModelLogs(token);
    return data as ModelLogRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

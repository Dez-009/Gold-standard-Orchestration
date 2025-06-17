// Generic admin helpers for fetching model log data

import { getToken } from './authUtils';
import { getModelLogs, getAgentOverrides, setAgentOverride } from './apiClient';
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

// Retrieve agent assignments with overrides for the admin page
export async function fetchAgentOverrides() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAgentOverrides(token);
    return data as { assignments: any[]; overrides: any[] };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Submit an override assigning an agent to a user
export async function assignAgentOverride(payload: {
  user_id: number;
  agent_id: string;
}) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await setAgentOverride(token, payload);
    return data as { id: number; user_id: number; agent_id: string; assigned_at: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

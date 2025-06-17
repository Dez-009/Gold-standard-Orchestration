// Service wrapper for fetching agent lifecycle logs

import { getToken } from './authUtils';
import { getAgentLifecycleLogs } from './apiClient';
import { showError } from '../components/ToastProvider';

// Notes: Shape of a lifecycle log record returned by the backend
export interface AgentLifecycleRecord {
  id: string;
  user_id: number;
  agent_name: string;
  event_type: string;
  timestamp: string;
  details: string | null;
}

// Notes: Fetch lifecycle logs with optional filter parameters
export async function fetchAgentLifecycleLogs(filters?: {
  agent_name?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAgentLifecycleLogs(token, filters || {});
    return data as AgentLifecycleRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

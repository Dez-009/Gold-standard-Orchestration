// Wrapper around API client for agent timeout logs

import { getToken } from './authUtils';
import { getAgentTimeouts } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface AgentTimeoutRecord {
  id: number;
  user_id: number;
  agent_name: string;
  timestamp: string;
}

// Fetch recent timeouts for admin dashboards
export async function fetchAgentTimeouts() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the timeout records from the backend
    const data = await getAgentTimeouts(token);
    return data as AgentTimeoutRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

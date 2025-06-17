// Service wrapper fetching orchestration logs for the admin view

import { getToken } from './authUtils';
import { getOrchestrationLogs } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface OrchestrationLogRecord {
  id: number;
  timestamp: string;
  user_id: number;
  user_prompt: string;
  agents_invoked: string;
  full_response: string;
}

// Retrieve orchestration logs with pagination support
export async function fetchOrchestrationLogs(limit = 100, offset = 0) {
  const token = getToken();
  if (!token) {
    // Notes: Inform the user when not authenticated
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request log data from the backend API
    const data = await getOrchestrationLogs(token, limit, offset);
    return data as OrchestrationLogRecord[];
  } catch (err) {
    // Notes: Surface a toast and rethrow on error
    showError('Something went wrong');
    throw err;
  }
}

// Wrapper around API client for agent failure queue

import { getToken } from './authUtils';
import { getAgentFailures, processFailureQueue } from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

export interface AgentFailureRecord {
  id: string;
  user_id: number;
  agent_name: string;
  failure_reason: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

// Fetch queued failures from the backend
export async function fetchAgentFailures() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request list of queued failures
    const data = await getAgentFailures(token);
    return data as AgentFailureRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Trigger queue processing via admin endpoint
export async function triggerFailureQueueProcessing() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    await processFailureQueue(token);
    showSuccess('Processing started');
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

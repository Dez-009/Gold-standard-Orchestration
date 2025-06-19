// Wrapper around API client for agent output flags

import { getToken } from './authUtils';
import { getAgentFlags, reviewAgentFlag } from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

export interface AgentFlagRecord {
  id: string;
  agent_name: string;
  user_id: number;
  summary_id?: string | null;
  reason: string;
  created_at: string;
  reviewed: boolean;
}

// Fetch flags for admin moderation table
export async function fetchAgentFlags() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAgentFlags(token);
    return data as AgentFlagRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Mark an entry as reviewed
export async function markAgentFlagReviewed(flagId: string) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    return;
  }
  try {
    await reviewAgentFlag(token, flagId);
    showSuccess('Flag reviewed');
  } catch {
    showError('Failed to update');
    throw new Error('Update failed');
  }
}

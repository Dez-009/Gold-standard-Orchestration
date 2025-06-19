// Service wrapper fetching global admin insights

import { getToken } from './authUtils';
import { getGlobalInsights } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface GlobalInsights {
  journals_last_7d: number;
  journals_last_30d: number;
  top_agent: string | null;
  top_feedback_reason: string | null;
  avg_mood: number;
  weekly_active_users: number;
}

export async function fetchGlobalInsights() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getGlobalInsights(token);
    return data as GlobalInsights;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

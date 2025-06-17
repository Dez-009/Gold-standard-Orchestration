// Service wrapper for fetching behavioral insights for a user

import { getToken } from './authUtils';
import { getBehavioralInsights } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface BehavioralInsight {
  id: number;
  user_id: number;
  insight_text: string;
  created_at: string;
  insight_type: string;
}

// Retrieve insights for the specified user id
export async function fetchBehavioralInsights(userId: number) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    const data = await getBehavioralInsights(userId, token);
    return data as BehavioralInsight[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Service wrapper fetching aggregated behavioral insights

import { getToken } from './authUtils';
import { getBehavioralInsights } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface BehavioralInsightsData {
  avg_checkins_per_week: number;
  journal_entries: number;
  completed_goals: number;
  top_active_users: { user_id: number; checkins: number }[];
  ai_summary: string;
}

// Retrieve metrics for the admin dashboard
export async function fetchBehavioralInsights() {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    const data = await getBehavioralInsights(token);
    return data as BehavioralInsightsData;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Service wrapper for fetching admin analytics summary

import { getToken } from './authUtils';
import { getAdminAnalyticsSummary } from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape of the summary data returned by the backend
export interface AnalyticsSummary {
  total_events: number;
  events_by_type: Record<string, number>;
  events_daily: Array<{ period: string; count: number }>;
  events_weekly: Array<{ period: string; count: number }>;
}

// Retrieve analytics summary using the stored JWT token
export async function fetchAdminAnalyticsSummary() {
  const token = getToken();
  if (!token) {
    // Notes: Reject when no authentication token is present
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate HTTP request to the API client helper
    const data = await getAdminAnalyticsSummary(token);
    return data as AnalyticsSummary;
  } catch (err) {
    // Notes: Propagate errors after notifying the user
    showError('Something went wrong');
    throw err;
  }
}

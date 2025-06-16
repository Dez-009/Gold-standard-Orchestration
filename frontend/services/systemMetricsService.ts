// Service for retrieving real-time system metrics for the admin dashboard
// Combines token retrieval with the API client call and basic error handling

import { getToken } from './authUtils';
import { getSystemMetrics } from './apiClient';
import { showError } from '../components/ToastProvider';

// Fetch overall system metrics from the backend
export async function fetchSystemMetrics() {
  // Notes: Obtain the stored JWT token to authenticate the request
  const token = getToken();
  if (!token) {
    // Notes: Show an error and throw when the user is not authenticated
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the metrics object from the backend API
    const data = await getSystemMetrics(token);
    // Notes: Return the metrics typed to the expected structure
    return data as {
      total_users: number;
      active_users: number;
      coaching_sessions: number;
      journal_entries: number;
      daily_check_ins: number;
      api_calls: number;
      tokens_used: number;
    };
  } catch (err) {
    // Notes: Surface request errors after notifying the user
    showError('Something went wrong');
    throw err;
  }
}

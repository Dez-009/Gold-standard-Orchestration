// Service for retrieving real-time system metrics for the admin dashboard
// Combines token retrieval with the API client call and basic error handling

import { getToken } from './authUtils';
import { fetchSystemMetrics as apiFetchSystemMetrics } from './apiClient';
import { showError } from '../components/ToastProvider';

// Fetch overall system metrics from the backend
export async function getMetrics() {
  // Notes: Obtain the stored JWT token to authenticate the request
  const token = getToken();
  if (!token) {
    // Notes: Show an error and throw when the user is not authenticated
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the metrics object from the backend API
    const data = await apiFetchSystemMetrics(token);
    // Notes: Cast and return the expected metrics structure
    return data as {
      total_users: number;
      active_subscriptions: number;
      total_revenue: number;
      ai_completions: number;
    };
  } catch (err) {
    // Notes: Surface request errors after notifying the user
    showError('Something went wrong');
    throw err;
  }
}

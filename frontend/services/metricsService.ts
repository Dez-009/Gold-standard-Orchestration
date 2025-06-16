// Service wrapping API client for system metrics
// Notes: Handles token retrieval and error display for the admin dashboard

import { getToken } from './authUtils';
import { getSystemMetrics } from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape of the metrics response returned by the backend
export interface SystemMetrics {
  active_users: number;
  total_subscriptions: number;
  load_average: number;
  job_queue_depth: number;
  api_request_count: number;
}

// Retrieve metrics while handling authentication and errors
export async function fetchSystemMetrics() {
  // Notes: Obtain the stored JWT token used for authorization
  const token = getToken();
  if (!token) {
    // Notes: Notify the user and throw when not authenticated
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Call the API client to fetch metrics data
    const data = await getSystemMetrics(token);
    // Notes: Cast the result to the SystemMetrics interface
    return data as SystemMetrics;
  } catch (err) {
    // Notes: Display a toast and rethrow on failure
    showError('Something went wrong');
    throw err;
  }
}

// Service wrapper for fetching revenue metrics for the admin dashboard

import { getToken } from './authUtils';
import { getRevenueSummary } from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape of the revenue summary returned by the backend
export interface RevenueSummary {
  active_subscriptions: number;
  mrr: number;
  arr: number;
  lifetime_revenue: number;
}

// Retrieve revenue metrics ensuring the user is authenticated
export async function fetchRevenueSummary() {
  const token = getToken();
  if (!token) {
    // Notes: Reject the request when no JWT token is available
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate HTTP request to the API client helper
    const data = await getRevenueSummary(token);
    return data as RevenueSummary;
  } catch (err) {
    // Notes: Surface any errors to the caller via toast
    showError('Something went wrong');
    throw err;
  }
}

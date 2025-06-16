// Service for retrieving all subscription records for admin dashboard
// Notes: Combines token retrieval, API client and error handling in one place

import { getToken } from './authUtils';
import { getAllSubscriptions } from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape of subscription data expected from the backend
export interface SubscriptionRecord {
  user_email: string;
  plan: string;
  status: string;
  start_date: string;
  next_billing_date: string | null;
  provider: string;
}

// Fetch all subscription records ensuring the user is authenticated
export async function fetchAllSubscriptions() {
  // Notes: Grab the JWT token from localStorage
  const token = getToken();
  if (!token) {
    // Notes: Signal authentication failure when token is missing
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate to the API client to perform the HTTP request
    const data = await getAllSubscriptions(token);
    // Notes: Return strongly typed subscription records
    return data as SubscriptionRecord[];
  } catch (err) {
    // Notes: Surface a friendly error toast then rethrow
    showError('Something went wrong');
    throw err;
  }
}

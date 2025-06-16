// Service wrapper for retrieving user account details
// Handles token management and delegates the API call to apiClient

import { getToken } from './authUtils';
import { getAccountDetails } from './apiClient';
import { showError } from '../components/ToastProvider';

// Fetch subscription status and billing info for the logged-in user
export async function fetchAccountDetails() {
  const token = getToken();
  if (!token) {
    // Propagate an error when authentication is missing
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve account details from the backend
    const data = await getAccountDetails(token);
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}


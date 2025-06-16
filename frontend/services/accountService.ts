// Service wrapper for retrieving user account details
// Handles token management and delegates the API call to apiClient

import { getToken } from './authUtils';
import { getAccountDetails, deleteAccount, updateProfile as updateAccountProfileRequest } from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

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

// Trigger account deletion for the logged-in user
export async function requestAccountDeletion() {
  // Notes: Obtain JWT token from localStorage
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Call the API client helper to delete the account
    await deleteAccount(token);
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Persist updates to the user's account profile
export async function updateProfile(data: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Forward the update to the API layer
    const result = await updateAccountProfileRequest(data, token);
    showSuccess('Saved successfully');
    return result as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}


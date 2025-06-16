// Service helper for exporting a user's complete data set
// Notes: Handles token retrieval and delegates the API call

import { getToken } from './authUtils';
import { requestDataExport } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Export all data belonging to the currently authenticated user
export async function exportUserData() {
  // Notes: Retrieve the JWT token from localStorage
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Ask the backend to generate the export package
    const data = await requestDataExport(token);
    showSuccess('Saved successfully');
    // Notes: Cast the result to a generic record for the caller
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

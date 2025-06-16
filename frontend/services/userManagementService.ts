// Service wrapper for fetching all users for the admin panel
// Combines token retrieval with the API client call

import { getToken } from './authUtils';
import { getAllUsers } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Retrieve every registered user from the backend for admin use
export async function fetchAllUsers() {
  const token = getToken();
  if (!token) {
    // Notes: Display an error and signal missing authentication
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the full list of users from the backend API
    const data = await getAllUsers(token);
    showSuccess('Saved successfully');
    // Notes: Cast the response to clarify the expected structure
    return data as Array<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
      created_at: string;
    }>;
  } catch (err) {
    // Notes: Surface any request errors to the caller
    showError('Something went wrong');
    throw err;
  }
}

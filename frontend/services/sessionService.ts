// Service helper for retrieving the user's past coaching sessions
// Combines token handling with the API client so components use a single function

import { getToken } from './authUtils';
import { getSessions } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Fetch the list of sessions for the authenticated user
export async function fetchSessions() {
  // Obtain the JWT token from local storage
  const token = getToken();
  if (!token) {
    // Throw an error when the user is not logged in
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Fetch previous session summaries
    const data = await getSessions(token);
    showSuccess('Saved successfully');
    // Notes: Return sessions in the expected format
    return data as Array<{ id: number; summary: string; created_at: string }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

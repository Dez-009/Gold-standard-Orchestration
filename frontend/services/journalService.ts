// Service for retrieving journal history for the logged-in user
// Relies on authUtils to fetch the stored JWT token and delegates
// the network request to apiClient.
import { getToken } from './authUtils';
import { getJournalEntries, getJournalHistory } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Fetch all journal entries belonging to the authenticated user
// Throws an error if no token is available in localStorage.
export async function fetchJournalEntries() {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error so the caller can handle it
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve journal entries from the backend
    const data = await getJournalEntries(token);
    showSuccess('Saved successfully');
    return data as Array<{ id: number; content: string; created_at: string }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Fetch previous journal entries specifically for the history page
// Mirrors fetchJournalEntries but uses the dedicated API client function
export async function fetchJournalHistory() {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error so the caller can handle it
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve journal history from the backend
    const data = await getJournalHistory(token);
    return data as Array<{ id: number; content: string; created_at: string }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

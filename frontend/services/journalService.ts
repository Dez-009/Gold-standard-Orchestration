// Service for retrieving journal history for the logged-in user
// Relies on authUtils to fetch the stored JWT token and delegates
// the network request to apiClient.
import { getToken } from './authUtils';
import { getJournalEntries } from './apiClient';

// Fetch all journal entries belonging to the authenticated user
// Throws an error if no token is available in localStorage.
export async function fetchJournalEntries() {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error so the caller can handle it
    throw new Error('User not authenticated');
  }
  // Delegate the HTTP GET call to the API client
  const data = await getJournalEntries(token);
  return data as Array<{ id: number; content: string; created_at: string }>;
}

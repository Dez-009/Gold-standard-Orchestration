// Service wrapper for retrieving the journal summary from the backend
// Relies on the generic apiClient and authUtils modules

import { getToken } from './authUtils';
import { getJournalSummary, postJournalSummary } from './apiClient';

// Fetch the latest journal summary for the logged-in user
export async function fetchJournalSummary() {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error when no token is found
    throw new Error('User not authenticated');
  }
  // Notes: Request the summary text from the backend service
  const data = await getJournalSummary(token);
  return data as {
    summary: string;
    retry_count: number;
    timeout_occurred: boolean;
  };
}

// Request the orchestration pipeline to generate a journal summary
export async function requestJournalSummary(user_id: string) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  // Notes: Submit the request and return the summary payload
  const data = await postJournalSummary(token, user_id);
  return data as {
    summary: string;
    retry_count: number;
    timeout_occurred: boolean;
  };
}

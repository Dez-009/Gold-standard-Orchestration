// Service for retrieving AI-generated journal trend insights
// Notes: Wraps API client call with auth and error handling
import { getToken } from './authUtils';
import { getJournalTrends } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Fetch the journal trend data for the logged-in user
export async function fetchJournalTrends() {
  const token = getToken();
  if (!token) {
    // Notes: Throw when authentication token is missing
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request trend analysis from the backend
    const data = await getJournalTrends(token);
    showSuccess('Saved successfully');
    return data as {
      mood_summary: unknown;
      keyword_trends: Record<string, number>;
      goal_progress_notes: string;
    };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

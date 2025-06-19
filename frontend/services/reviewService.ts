// Service for retrieving the weekly review summary
// Notes: Combines token retrieval and API client call into a helper
import { getToken } from './authUtils';
import { getWeeklyReview } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Fetch the most recent weekly review for the current user
export async function fetchWeeklyReview() {
  // Notes: Read the JWT token from local storage
  const token = getToken();
  if (!token) {
    // Notes: Caller will redirect if authentication fails
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve the summary information from the backend
    const data = await getWeeklyReview(token);
    showSuccess('Saved successfully');
    return data as {
      week_range: string;
      summary: string;
      highlights?: string[];
    } | null;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

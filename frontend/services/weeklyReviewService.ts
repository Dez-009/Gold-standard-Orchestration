// Service for retrieving the detailed weekly review summary
// Notes: Wraps the API client call and handles token retrieval
import { getToken } from './authUtils';
import { getWeeklyReview } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Fetch aggregated weekly review data including mood and goal progress
export async function fetchWeeklyReview() {
  // Notes: Pull the JWT token from local storage
  const token = getToken();
  if (!token) {
    // Notes: Signal authentication failure to the caller
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the weekly review summary from the backend
    const data = await getWeeklyReview(token);
    showSuccess('Saved successfully');
    // Notes: Cast the response to the expected structure
    return data as {
      avg_mood: number;
      journal_count: number;
      goal_progress: Array<{ name: string; percent_complete: number }>;
      ai_insights: string;
    } | null;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

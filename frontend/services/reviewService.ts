// Service for retrieving the latest weekly review
// Combines token retrieval and API client call into a single helper
import { getToken } from './authUtils';
import { getWeeklyReview } from './apiClient';

// Fetch the most recent weekly review for the current user
export async function fetchWeeklyReview() {
  // Obtain the stored JWT token from the browser
  const token = getToken();
  if (!token) {
    // Throw an error when no token is available so caller can redirect
    throw new Error('User not authenticated');
  }
  // Delegate the HTTP GET to the API client and return the result
  const data = await getWeeklyReview(token);
  return data as { id: number; content: string; created_at: string } | null;
}

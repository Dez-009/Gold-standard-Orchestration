// Service wrapper to fetch completed goal history for the user

// Notes: Helper to retrieve the stored JWT token
import { getToken } from './authUtils';
// Notes: API client function that hits the /goals/history endpoint
import { getCompletedGoals } from './apiClient';
import { showError } from '../components/ToastProvider';

// Fetch the list of completed goals from the backend
export async function fetchCompletedGoals() {
  // Notes: Obtain JWT token required for authentication
  const token = getToken();
  if (!token) {
    // Notes: Propagate an error when the user is not logged in
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate the HTTP request to the API client
    const data = await getCompletedGoals(token);
    // Notes: Cast the response to the expected shape
    return data as Array<{
      id: number;
      title: string;
      category: string;
      completed_at: string;
      notes?: string | null;
    }>;
  } catch (err) {
    // Notes: Show a toast when the request fails
    showError('Something went wrong');
    throw err;
  }
}

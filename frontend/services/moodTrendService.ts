// Service for retrieving mood trend data from the backend
// Notes: Encapsulates token handling and error notification logic
import { getToken } from './authUtils';
import { getMoodTrends } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Fetch the history of moods for the logged-in user
export async function fetchMoodTrends() {
  const token = getToken();
  if (!token) {
    // Notes: Caller must redirect to login if authentication fails
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve the mood trend records from the backend
    const data = await getMoodTrends(token);
    showSuccess('Saved successfully');
    return data as Array<{ date: string; mood: string }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

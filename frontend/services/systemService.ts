// Notes: Helper functions related to overall system health
import { getToken } from './authUtils';
import { getSystemHealth } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Notes: Fetch health details for API, database and AI service
export async function fetchSystemHealth() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getSystemHealth(token);
    showSuccess('Saved successfully');
    return data as { api: string; database: string; ai: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

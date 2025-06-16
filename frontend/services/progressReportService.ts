// Service for fetching AI-powered progress reports
// Notes: Wraps API client call and handles authentication
import { getToken } from './authUtils';
import { getProgressReport } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Retrieve the text-based progress report for the current user
export async function fetchProgressReport() {
  // Notes: Obtain JWT token from local storage
  const token = getToken();
  if (!token) {
    // Notes: Throw an error when no token is present
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the report from the backend using the API client
    const data = await getProgressReport(token);
    showSuccess('Saved successfully');
    // Notes: Cast response to expected shape and return
    return data as { report: string } | null;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Service for retrieving system health details for the admin page
// Combines token retrieval with the API client call

import { getToken } from './authUtils';
import { getSystemHealth } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Fetch the current system health information
export async function fetchSystemHealth() {
  // Obtain the stored JWT token from the browser
  const token = getToken();
  if (!token) {
    // Throw when no authentication token is available
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Request the health status from the backend
    const data = await getSystemHealth(token);
    // Provide the expected shape of the response object
    return data as {
      database: string;
      ai: string;
      disk_space: string;
      uptime: string;
      timestamp: string;
    };
  } catch (err) {
    // Propagate errors after showing a toast message
    showError('Something went wrong');
    throw err;
  }
}

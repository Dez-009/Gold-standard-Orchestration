// Service wrapper for retrieving system logs for admins
// Combines token retrieval with API client function

import { getToken } from './authUtils';
import { getSystemLogs } from './apiClient';

// Fetch system logs from the backend API
export async function fetchSystemLogs() {
  // Get the stored JWT token for authorization
  const token = getToken();
  if (!token) {
    // Throw when authentication token is missing
    throw new Error('User not authenticated');
  }
  // Request the log data via the API client
  const data = await getSystemLogs(token);
  // Cast the response to the expected structure
  return data as Array<{
    timestamp: string;
    level: string;
    source: string;
    message: string;
  }>;
}

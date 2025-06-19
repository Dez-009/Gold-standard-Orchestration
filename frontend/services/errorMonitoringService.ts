// Service wrapper for retrieving application error logs for the admin dashboard
// Combines token retrieval with the API client call and error handling

import { getToken } from './authUtils';
import { getErrorLogs } from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape of an error log record returned by the backend
export interface ErrorLogRecord {
  timestamp: string;
  type: string;
  route: string;
  message: string;
  request_id?: string;
}

// Fetch all captured error logs ensuring the user is authenticated
export async function fetchErrorLogs() {
  // Notes: Obtain the stored JWT token from localStorage
  const token = getToken();
  if (!token) {
    // Notes: Show a toast and throw when authentication is missing
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the error logs from the backend API
    const data = await getErrorLogs(token);
    // Notes: Return the strongly typed list of error records
    return data as ErrorLogRecord[];
  } catch (err) {
    // Notes: Surface errors to the caller after showing a toast
    showError('Something went wrong');
    throw err;
  }
}

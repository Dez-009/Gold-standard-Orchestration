// Service for fetching subscription reminder delivery logs
// Notes: Combines token retrieval with API client and error handling

import { getToken } from './authUtils';
import { getReminderLogs } from './apiClient';
import { showError } from '../components/ToastProvider';

// Notes: Shape describing a reminder log record returned by the backend
export interface ReminderLogRecord {
  user_email: string;
  subscription_id: number;
  sent_at: string;
  renew_date: string;
  status: string;
  error_message: string | null;
}

// Notes: Fetch reminder logs for admin display
export async function fetchReminderLogs() {
  const token = getToken();
  if (!token) {
    // Notes: Authentication token is required for admin endpoints
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate HTTP request to the API client
    const data = await getReminderLogs(token);
    // Notes: Cast and return the typed array of log entries
    return data as ReminderLogRecord[];
  } catch (err) {
    // Notes: Display a toast then rethrow so the page can handle it
    showError('Something went wrong');
    throw err;
  }
}

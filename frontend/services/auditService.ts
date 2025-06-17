// Service wrapper for the admin audit log list

import { getToken } from './authUtils';
import { getAuditLogs } from './apiClient';
import { showError } from '../components/ToastProvider';

// Notes: Shape of an audit log record returned by the backend
export interface AuditLogRecord {
  id: number;
  timestamp: string;
  user_id: number | null;
  event_type: string;
  details: string | null;
}

// Retrieve audit logs from the API ensuring authentication
export async function fetchAuditLogs(limit = 100, offset = 0) {
  const token = getToken();
  if (!token) {
    // Notes: Inform the user the session is missing
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the paginated logs via the API client
    const data = await getAuditLogs(token, limit, offset);
    return data as AuditLogRecord[];
  } catch (err) {
    // Notes: Show a toast and rethrow on error
    showError('Something went wrong');
    throw err;
  }
}


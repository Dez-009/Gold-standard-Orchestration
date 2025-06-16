// Notes: Service wrapper for fetching audit logs from the backend
// Notes: Combines token retrieval and API request logic

import { getToken } from './authUtils';
import { getAuditLogs } from './apiClient';

// Notes: Retrieve all audit logs for admin visibility
export async function fetchAuditLogs() {
  // Notes: Obtain the JWT token from localStorage
  const token = getToken();
  if (!token) {
    // Notes: Abort when the user is not authenticated
    throw new Error('User not authenticated');
  }
  // Notes: Request the log data using the API client helper
  const data = await getAuditLogs(token);
  // Notes: Cast the response to the expected shape for the UI layer
  return data as Array<{
    id: number;
    timestamp: string;
    user_email: string | null;
    action: string;
    detail: string | null;
    ip_address?: string | null;
  }>;
}

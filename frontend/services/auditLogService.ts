// Notes: Service wrapper for fetching audit logs from the backend
// Notes: Combines token retrieval and API request logic

import { getToken } from './authUtils';
import { getAuditLogs } from './apiClient';

// Notes: Retrieve all audit logs for admin visibility
export async function fetchAuditLogs() {
  // Notes: Obtain the JWT token stored in the browser
  const token = getToken();
  if (!token) {
    // Notes: Fail when no authentication token is available
    throw new Error('User not authenticated');
  }
  // Notes: Delegate the HTTP request to the API client
  const data = await getAuditLogs(token);
  // Notes: Provide the expected structure of the returned list
  return data as Array<{
    id: number;
    user_id: number;
    action: string;
    metadata: string | null;
    created_at: string;
  }>;
}

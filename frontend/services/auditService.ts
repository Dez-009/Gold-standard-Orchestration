// Service wrapper for fetching audit logs from the backend
// Combines token retrieval and API request logic

import { getToken } from './authUtils';
import { getAuditLogs } from './apiClient';

// Retrieve all audit logs for internal testing visibility
export async function fetchAuditLogs() {
  // Obtain the JWT token stored in the browser
  const token = getToken();
  if (!token) {
    // Fail when no authentication token is available
    throw new Error('User not authenticated');
  }
  // Delegate the HTTP request to the API client
  const data = await getAuditLogs(token);
  // Provide the expected structure of the returned list
  return data as Array<{
    id: number;
    user_id: number;
    action: string;
    metadata: string | null;
    created_at: string;
  }>;
}

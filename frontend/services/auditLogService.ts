// Notes: Service wrapper for fetching audit logs from the backend
// Notes: Combines token retrieval and API request logic
// Usage example:
//   const logs = await fetchAuditLogs({ user_id: 1 });

import { getToken } from './authUtils';
import apiClient from './apiClient';

// Define the audit log interface based on the actual backend response
export interface AuditLog {
  id: number;
  timestamp: string;
  user_id: number | null;
  event_type: string;
  details: string | null;
}

// Define filter interface
export interface AuditLogFilters {
  limit?: number;
  offset?: number;
  user_id?: number;
  action?: string;
  start_date?: string;
  end_date?: string;
}

// Notes: Retrieve audit logs with filtering options
export async function fetchAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
  // Notes: Obtain the JWT token from localStorage
  const token = getToken();
  if (!token) {
    // Notes: Abort when the user is not authenticated
    throw new Error('User not authenticated');
  }
  
  // Notes: Request the log data using the API client helper
  const response = await apiClient.get('/admin/audit-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });
  
  // Notes: Return the audit logs with proper typing
  return response.data as AuditLog[];
}

// Notes: Retrieve audit log statistics
export async function fetchAuditStats(): Promise<{
  total_logs: number;
  recent_logs_24h: number;
  action_breakdown: Array<{action: string; count: number}>;
}> {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  
  const response = await apiClient.get('/admin/audit/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  return response.data;
}

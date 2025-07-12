// Service wrapper for retrieving application error logs for the admin dashboard
// Combines token retrieval with the API client call and error handling

import { getToken } from './authUtils';
import { getErrorLogs, getErrorLog, updateErrorLog, getErrorStats } from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape of an error log record returned by the backend
export interface ErrorLogRecord {
  id: string;
  timestamp: string;
  type: string;
  route: string;
  message: string;
  request_id?: string;
  error_type: string;
  error_code?: string;
  stack_trace?: string;
  method?: string;
  user_agent?: string;
  ip_address?: string;
  user_id?: number;
  request_data?: any;
  environment?: string;
  service_name?: string;
  severity: string;
  resolved: string;
  created_at: string;
  resolved_at?: string;
  admin_notes?: string;
}

// Filter options for error logs
export interface ErrorLogFilters {
  error_type?: string;
  severity?: string;
  resolved?: string;
  route?: string;
  start_date?: string;
  end_date?: string;
  user_id?: number;
  limit?: number;
  offset?: number;
}

// Error statistics response
export interface ErrorStats {
  period_days: number;
  total_errors: number;
  unresolved_errors: number;
  error_types: Record<string, number>;
  severities: Record<string, number>;
  resolutions: Record<string, number>;
}

// Update payload for error logs
export interface ErrorLogUpdate {
  resolved?: string;
  admin_notes?: string;
  severity?: string;
}

// Fetch all captured error logs ensuring the user is authenticated
export async function fetchErrorLogs(filters?: ErrorLogFilters): Promise<ErrorLogRecord[]> {
  // Notes: Obtain the stored JWT token from localStorage
  const token = getToken();
  if (!token) {
    // Notes: Show a toast and throw when authentication is missing
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the error logs from the backend API with optional filters
    const data = await getErrorLogs(token, filters);
    // Notes: Return the strongly typed list of error records
    return data as ErrorLogRecord[];
  } catch (err) {
    // Notes: Surface errors to the caller after showing a toast
    showError('Something went wrong');
    throw err;
  }
}

// Fetch a specific error log by ID
export async function fetchErrorLog(errorId: string): Promise<ErrorLogRecord> {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getErrorLog(token, errorId);
    return data as ErrorLogRecord;
  } catch (err) {
    showError('Failed to fetch error details');
    throw err;
  }
}

// Update an error log (e.g., mark as resolved, add notes)
export async function updateErrorLogRecord(errorId: string, updateData: ErrorLogUpdate): Promise<ErrorLogRecord> {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await updateErrorLog(token, errorId, updateData);
    return data as ErrorLogRecord;
  } catch (err) {
    showError('Failed to update error log');
    throw err;
  }
}

// Fetch error statistics for the admin dashboard
export async function fetchErrorStats(days: number = 7): Promise<ErrorStats> {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getErrorStats(token, days);
    return data as ErrorStats;
  } catch (err) {
    showError('Failed to fetch error statistics');
    throw err;
  }
}

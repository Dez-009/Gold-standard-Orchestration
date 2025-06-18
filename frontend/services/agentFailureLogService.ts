// Wrapper around API client for agent failure logs

// Notes: Helper to fetch stored token from local storage
import { getToken } from './authUtils';
// Notes: API client function performing the HTTP request
import { getAgentFailures } from './apiClient';
// Notes: Toast helper to display errors to the user
import { showError } from '../components/ToastProvider';

// Notes: Shape of the failure log record returned by the backend
export interface AgentFailureLog {
  id: string;
  user_id: number;
  agent_name: string;
  reason: string;
  failed_at: string;
}

// Fetch recent agent failures with optional pagination
export async function fetchAgentFailureLogs(limit?: number, offset?: number) {
  // Notes: Retrieve stored JWT token for authorization
  const token = getToken();
  if (!token) {
    // Notes: Notify the user when token is missing
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Invoke API client with pagination parameters
    const data = await getAgentFailures(token, limit, offset);
    // Notes: Cast to expected structure for the caller
    return data as { results: AgentFailureLog[] };
  } catch (err) {
    // Notes: Show toast and rethrow so caller can handle
    showError('Something went wrong');
    throw err;
  }
}


// Service wrapping agent assignment API calls

import { getToken } from './authUtils';
import { assignAgent as assignAgentRequest } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Assign a domain-specific agent to the current user
export async function assignAgent(domain: string) {
  const token = getToken();
  if (!token) {
    // Notes: Calling code must ensure the user is authenticated
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate the HTTP request to the API client
    const data = await assignAgentRequest(domain, token);
    showSuccess('Saved successfully');
    // Notes: Return the assignment record typed as a generic object
    return data as { id: number; user_id: number; agent_type: string; assigned_at: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

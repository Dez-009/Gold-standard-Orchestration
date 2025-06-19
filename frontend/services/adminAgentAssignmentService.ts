// Service wrapper around admin agent assignment endpoints

import { getToken, isAdmin } from './authUtils';
import { listAgentAssignments, assignAgentToUser } from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

// Fetch all agent assignments for the admin table
export async function fetchAgentAssignments(limit?: number, offset?: number) {
  const token = getToken();
  if (!token || !isAdmin()) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await listAgentAssignments(token, limit, offset);
    return data as Array<{
      user_id: number;
      user_email: string;
      domain: string;
      assigned_agent: string;
      assigned_at: string;
    }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Assign a specific agent to a user and domain
export async function assignAgent(
  user_id: number,
  domain: string,
  assigned_agent: string
) {
  const token = getToken();
  if (!token || !isAdmin()) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await assignAgentToUser(token, user_id, domain, assigned_agent);
    showSuccess('Agent assigned');
    return data as {
      id: string;
      user_id: number;
      domain: string;
      assigned_agent: string;
      assigned_at: string;
    };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

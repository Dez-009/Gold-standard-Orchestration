/**
 * Service layer functions for interacting with agent state admin APIs.
 */

import { getToken } from './authUtils';
import { getAgentStates, updateAgentState } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface AgentStateRecord {
  id: string;
  user_id: number;
  agent_name: string;
  state: string;
  created_at: string;
  updated_at: string;
}

// Fetch all agent states from the backend
export async function fetchAgentStates(limit?: number, offset?: number) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request state list using API client helper
    const data = await getAgentStates(token, limit, offset);
    return data as AgentStateRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Modify a specific agent state value
export async function modifyAgentState(payload: {
  user_id: number;
  agent_name: string;
  state: string;
}) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Send POST request with updated state payload
    const data = await updateAgentState(token, payload);
    return data as AgentStateRecord;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

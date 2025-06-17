// Service wrapper for retrieving agent access rules

import { getToken } from './authUtils';
import { getAgentAccessRules } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface AgentAccessRule {
  agent: string;
  role: string;
}

export async function fetchAgentAccessRules() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAgentAccessRules(token);
    return data as AgentAccessRule[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

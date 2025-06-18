// Service wrapper for retrieving agent access rules

import { getToken } from './authUtils';
import { getAgentAccessRules, getAgentAccess, updateAgentAccess } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface AgentAccessRule {
  agent: string;
  role: string;
}

export interface AccessPolicy {
  agent_name: string;
  subscription_tier: string;
  is_enabled: boolean;
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

// Retrieve the full agent access policy matrix
export async function fetchAccessPolicies() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAgentAccess(token);
    return data as AccessPolicy[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Update a single policy row
export async function saveAccessPolicy(
  agent_name: string,
  subscription_tier: string,
  is_enabled: boolean
) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    return;
  }
  try {
    await updateAgentAccess(token, { agent_name, subscription_tier, is_enabled });
  } catch {
    showError('Failed to update');
    throw new Error('Update failed');
  }
}

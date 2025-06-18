// Service wrapper for retrieving agent access rules

import { getToken } from './authUtils';
import {
  getAgentAccessRules,
  getAgentAccessConfig,
  updateAgentAccessTier
} from './apiClient';
import { showError } from '../components/ToastProvider';

export interface AgentAccessRule {
  agent: string;
  role: string;
}

export interface AccessConfig {
  agent_name: string;
  access_tier: string;
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
export async function fetchAccessConfig() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAgentAccessConfig(token);
    return data as AccessConfig[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Update a single policy row
export async function saveAccessTier(agent_name: string, access_tier: string) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    return;
  }
  try {
    await updateAgentAccessTier(token, { agent_name, access_tier });
  } catch {
    showError('Failed to update');
    throw new Error('Update failed');
  }
}

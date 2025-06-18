// Service wrapper for prompt version API calls

import { getToken } from './authUtils';
import { getPromptVersions, postPromptVersion } from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

// Fetch versions for a given agent
export async function fetchPromptVersions(agentName: string) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    const data = await getPromptVersions(token, agentName);
    return data as any[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Create a new prompt version
export async function createPromptVersion(payload: {
  agentName: string;
  version: string;
  template: string;
  metadata?: any;
}) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await postPromptVersion(token, payload);
    showSuccess('Saved successfully');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

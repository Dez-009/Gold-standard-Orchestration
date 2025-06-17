// Service wrapper around the admin agent query API

import { getToken } from './authUtils';
import { adminAgentQuery } from './apiClient';
import { showError } from '../components/ToastProvider';

// Execute an admin agent query using the stored JWT token
export async function queryAdminAgent(user_prompt: string) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await adminAgentQuery(token, user_prompt);
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

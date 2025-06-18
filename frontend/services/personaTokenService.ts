/**
 * Helpers for assigning and fetching persona tokens via the backend API.
 */

import { getToken } from './authUtils';
import { postPersonaToken, getPersonaToken } from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

// Assign a persona token to a user
export async function addPersonaToken(user_id: number, token_name: string) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await postPersonaToken(token, { user_id, token_name });
    showSuccess('Saved successfully');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Get the current persona token for a user
export async function getUserPersonaToken(user_id: number) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    const data = await getPersonaToken(token, user_id);
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

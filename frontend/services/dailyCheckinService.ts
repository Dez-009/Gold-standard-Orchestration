// Helper service exposing high level check-in operations

import { getToken } from './authUtils';
import { submitCheckin, fetchCheckins } from './apiClient';
import { showError } from '../components/ToastProvider';

// Submit a new health check-in for the logged in user
export async function submitCheckinEntry(data: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    return await submitCheckin(token, data);
  } catch {
    showError('Failed to submit check-in');
    throw new Error('Failed request');
  }
}

// Retrieve the list of check-ins for the logged in user
export async function getCheckins() {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    return await fetchCheckins(token);
  } catch {
    showError('Failed to load check-ins');
    throw new Error('Failed request');
  }
}

// Service helpers for user personalization settings

import { getToken } from './authUtils';
import { getPersonalizations, savePersonalization } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Fetch personalization profiles for the logged-in user
export async function fetchPersonalizations() {
  const token = getToken();
  if (!token) {
    // Notes: Caller must ensure user is authenticated
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate HTTP request to apiClient
    const data = await getPersonalizations(token);
    showSuccess('Saved successfully');
    return data as Array<{ id: string; agent_name: string; personality_profile: string }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Update or create a personalization profile for an agent
export async function updatePersonalization(agent: string, profile: string) {
  const token = getToken();
  if (!token) {
    // Notes: Reject when authentication token is missing
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Persist the profile via apiClient helper
    const data = await savePersonalization(token, agent, profile);
    showSuccess('Saved successfully');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}


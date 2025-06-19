// Wrapper around agent personality API calls

import { getToken } from './authUtils';
import {
  assignPersonality as apiAssignPersonality,
  getPersonalityAssignment as apiGetPersonalityAssignment
} from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Persist the selected personality for a domain
export async function setPersonality(domain: string, personality: string) {
  const token = getToken();
  if (!token) {
    // Notes: Caller must ensure authentication exists
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate the HTTP call to the apiClient helper
    const data = await apiAssignPersonality(token, domain, personality);
    showSuccess('Saved successfully');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Fetch the currently assigned personality for a domain
export async function fetchPersonality(domain: string) {
  const token = getToken();
  if (!token) {
    // Notes: Reject when the user is not authenticated
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve the assignment using the apiClient helper
    const data = await apiGetPersonalityAssignment(token, domain);
    showSuccess('Saved successfully');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

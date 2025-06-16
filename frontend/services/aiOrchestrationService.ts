// Service for routing AI prompts through the orchestration backend
// Handles token retrieval and calls the apiClient helper

import { getToken } from './authUtils';
import { orchestrateAiRequest } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Route a prompt to the user's assigned agent and return the response
export async function routeAiRequest(prompt: string) {
  // Notes: Retrieve the JWT token stored in local storage
  const token = getToken();
  if (!token) {
    // Notes: Caller must ensure user is authenticated
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate network call to the apiClient helper
    const data = await orchestrateAiRequest(prompt, token);
    showSuccess('Saved successfully');
    // Notes: Return typed object containing agent and response text
    return data as { agent: string; response: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

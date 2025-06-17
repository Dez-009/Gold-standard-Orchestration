// Service for routing AI prompts through the orchestration backend
// Handles token retrieval and calls the apiClient helper

import { getToken } from './authUtils';
import {
  orchestrateAiRequest,
  postLegacyOrchestrationPrompt
} from './apiClient';
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

// Send a prompt through the new multi-agent orchestration endpoint
export async function sendOrchestrationPrompt(user_prompt: string) {
  // Notes: Retrieve JWT token from local storage
  const token = getToken();
  if (!token) {
    // Notes: Enforce authentication check before making request
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Decode user_id from the token payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.user_id as number;
    // Notes: Delegate network request to the apiClient helper
    const data = await postLegacyOrchestrationPrompt(token, userId, user_prompt);
    showSuccess('Saved successfully');
    // Notes: Typed return value containing array of agent responses
    return data as { responses: { agent: string; response: string }[] };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

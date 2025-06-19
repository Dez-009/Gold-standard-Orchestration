// Service for interacting with the orchestration processor
// Handles token retrieval and delegates POST requests to the API client

import { getToken } from './authUtils';
import { postOrchestrationPrompt } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Send a free-form prompt through the orchestration engine
export async function askVida(prompt: string): Promise<string> {
  const token = getToken();
  if (!token) {
    // Notes: Authentication is required for this request
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate network call to the API client helper
    const data = await postOrchestrationPrompt(token, prompt);
    showSuccess('Saved successfully');
    // Notes: Extract the aggregated response text from the payload
    return data.response as string;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

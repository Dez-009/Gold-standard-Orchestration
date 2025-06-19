// Service for retrieving AI coaching responses
// Handles token retrieval and delegates POST request to the API client
// Exposes a single helper used by the Coach page to interact with the backend.

import { getToken } from './authUtils';
import { postAiPrompt } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Return the AI coach's reply to the given prompt
export async function getAiResponse(prompt: string): Promise<string> {
  // Grab the stored JWT token from local storage
  const token = getToken();
  if (!token) {
    // Bubble up an error if the user is missing a token; the caller can
    // decide how to handle authentication failures.
    throw new Error('User not authenticated');
  }

  try {
    // Notes: Send the prompt and await the AI response
    const data = await postAiPrompt(prompt, token);
    showSuccess('Saved successfully');
    // Notes: Return only the AI text from the payload
    return data.response as string;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

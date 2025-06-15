// Service for retrieving AI coaching responses
// Handles token retrieval and delegates POST request to the API client

import { getToken } from './authUtils';
import { postAiPrompt } from './apiClient';

// Return the AI coach's reply to the given prompt
export async function getAiResponse(prompt: string): Promise<string> {
  // Grab the stored JWT token from local storage
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  // Send the prompt to the backend and extract the response text
  const data = await postAiPrompt(prompt, token);
  return data.response as string;
}

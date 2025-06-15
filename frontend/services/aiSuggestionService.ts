// Service for fetching AI goal suggestions
// Handles token retrieval and delegates network call to the API client

import { getToken } from './authUtils';
import { getAiSuggestions } from './apiClient';

// Retrieve the suggestion text for the current user
export async function fetchAiSuggestions() {
  // Obtain the JWT token stored in the browser
  const token = getToken();
  if (!token) {
    // Throw an error if the user is not authenticated
    throw new Error('User not authenticated');
  }
  // Delegate the GET request to the shared API client
  const data = await getAiSuggestions(token);
  // Backend returns an object with a "suggestions" field containing text
  return data.suggestions as string;
}

// Service wrapper around goal suggestion API
// Notes: Handles token retrieval and delegates request to the API client

import { getToken } from './authUtils';
import { getGoalSuggestions } from './apiClient';

// Fetch the list of goal suggestions for the logged-in user
export async function fetchGoalSuggestions() {
  // Notes: Obtain JWT token from localStorage
  const token = getToken();
  if (!token) {
    // Notes: Throw error when not authenticated so caller can redirect
    throw new Error('User not authenticated');
  }
  // Notes: Perform network request via the shared API client
  const data = await getGoalSuggestions(token);
  // Notes: Expect the backend to return an array of suggestion objects
  return data as Array<{ id: number; description: string; category: string }>;
}

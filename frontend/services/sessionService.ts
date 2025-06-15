// Service helper for retrieving the user's past coaching sessions
// Combines token handling with the API client so components use a single function

import { getToken } from './authUtils';
import { getSessions } from './apiClient';

// Fetch the list of sessions for the authenticated user
export async function fetchSessions() {
  // Obtain the JWT token from local storage
  const token = getToken();
  if (!token) {
    // Throw an error when the user is not logged in
    throw new Error('User not authenticated');
  }
  // Delegate the HTTP request to the API client
  const data = await getSessions(token);
  // Specify the expected structure of the response
  return data as Array<{ id: number; summary: string; created_at: string }>;
}

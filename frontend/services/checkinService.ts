// Service for handling daily check-in operations
// Combines token retrieval with API client calls so components only import this file

import { getToken } from './authUtils';
import { postDailyCheckin, getDailyCheckins } from './apiClient';

// Save a new daily check-in for the logged-in user
// Requires reflection text and mood selection
export async function saveCheckin(reflection: string, mood: string) {
  // Obtain the JWT token stored in the browser
  const token = getToken();
  if (!token) {
    // Signal an authentication failure if no token is found
    throw new Error('User not authenticated');
  }
  // Delegate the POST request to the API client and return the result
  const data = await postDailyCheckin({ reflection, mood }, token);
  return data as { id: number; reflection: string; mood: string; created_at: string };
}

// Retrieve all daily check-ins for the current user
export async function fetchCheckins() {
  // Get the JWT token from local storage
  const token = getToken();
  if (!token) {
    // Throw an error if the user is not logged in
    throw new Error('User not authenticated');
  }
  // Call the API client to fetch the list of check-ins
  const data = await getDailyCheckins(token);
  return data as Array<{ id: number; reflection: string; mood: string; created_at: string }>;
}

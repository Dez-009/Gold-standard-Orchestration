// Service wrapper for CRUD operations on user goals
// Uses authUtils to obtain the JWT token and delegates HTTP calls to apiClient

import { getToken } from './authUtils';
import { postGoal, getGoals } from './apiClient';

// Persist a new goal to the backend for the logged-in user
export async function saveGoal(content: string) {
  const token = getToken();
  if (!token) {
    // Throw an error if there is no authentication token available
    throw new Error('User not authenticated');
  }
  // Send the new goal to the backend API and return the response
  const data = await postGoal(content, token);
  return data as { id: number; content: string; created_at: string };
}

// Retrieve all goals belonging to the currently logged-in user
export async function fetchGoals() {
  const token = getToken();
  if (!token) {
    // Signal to the caller that authentication is required
    throw new Error('User not authenticated');
  }
  // Fetch the goal list from the backend API and return the data
  const data = await getGoals(token);
  return data as Array<{ id: number; content: string; created_at: string }>;
}

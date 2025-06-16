// Service wrapper for CRUD operations on user goals
// Uses authUtils to obtain the JWT token and delegates HTTP calls to apiClient

import { getToken } from './authUtils';
import { postGoal, getGoals, getGoalProgress } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Persist a new goal to the backend for the logged-in user
export async function saveGoal(content: string) {
  const token = getToken();
  if (!token) {
    // Throw an error if there is no authentication token available
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Persist the goal to the backend
    const data = await postGoal(content, token);
    showSuccess('Saved successfully');
    return data as { id: number; content: string; created_at: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Retrieve all goals belonging to the currently logged-in user
export async function fetchGoals() {
  const token = getToken();
  if (!token) {
    // Signal to the caller that authentication is required
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve the user's goals from the backend
    const data = await getGoals(token);
    showSuccess('Saved successfully');
    return data as Array<{ id: number; content: string; created_at: string }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Retrieve goal progress information for the logged-in user
export async function fetchGoalProgress() {
  const token = getToken();
  if (!token) {
    // Notify the caller that there is no active session
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request progress data from the backend service
    const data = await getGoalProgress(token);
    showSuccess('Saved successfully');
    return data as Array<{
      id: number;
      title: string;
      target?: number;
      progress?: number;
      updated_at: string;
    }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Service for handling daily check-in operations
// Combines token retrieval with API client calls so components only import this file

import { getToken } from './authUtils';
// Notes: Import specific API helpers for check-in operations
import {
  postDailyCheckin,
  getDailyCheckins,
  // Newly added helpers targeting a single check-in
  getDailyCheckIn,
  postDailyCheckIn
} from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Save a new daily check-in for the logged-in user
// Requires reflection text and mood selection
export async function saveCheckin(reflection: string, mood: string) {
  // Obtain the JWT token stored in the browser
  const token = getToken();
  if (!token) {
    // Signal an authentication failure if no token is found
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Send the reflection and mood to be stored
    const data = await postDailyCheckin({ reflection, mood }, token);
    showSuccess('Saved successfully');
    return data as { id: number; reflection: string; mood: string; created_at: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Retrieve all daily check-ins for the current user
export async function fetchCheckins() {
  // Get the JWT token from local storage
  const token = getToken();
  if (!token) {
    // Throw an error if the user is not logged in
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve existing check-ins for the user
    const data = await getDailyCheckins(token);
    showSuccess('Saved successfully');
    return data as Array<{ id: number; reflection: string; mood: string; created_at: string }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Retrieve today's check-in if it exists
export async function fetchDailyCheckIn() {
  const token = getToken();
  if (!token) {
    // Signal authentication failure when token is missing
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the current day's check-in from the API
    const data = await getDailyCheckIn(token);
    showSuccess('Saved successfully');
    return data as { id: number; reflection: string; mood: string; created_at: string } | null;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Submit today's check-in using reflection text and mood
export async function submitDailyCheckIn(reflection: string, mood: string) {
  const token = getToken();
  if (!token) {
    // Notes: Prevent submission when the user is not logged in
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Send the check-in data to be stored
    const data = await postDailyCheckIn({ reflection, mood }, token);
    showSuccess('Saved successfully');
    return data as { id: number; reflection: string; mood: string; created_at: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

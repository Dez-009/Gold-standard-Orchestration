// Service helpers for retrieving and submitting the user's daily mood
// Wraps token retrieval and API client calls so components only import this file

import { getToken } from './authUtils';
import { getMood, postMood } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Fetch the mood entry for today for the logged-in user
export async function fetchMood() {
  const token = getToken();
  if (!token) {
    // Signal an authentication failure when no token is available
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve today's mood from the backend
    const data = await getMood(token);
    showSuccess('Saved successfully');
    return data as { mood: string; date: string } | null;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Submit or update today's mood for the logged-in user
export async function submitMood(mood: string) {
  const token = getToken();
  if (!token) {
    // Throw an error if the user is not authenticated
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Send the selected mood to be stored or updated
    const data = await postMood(mood, token);
    showSuccess('Saved successfully');
    return data as { mood: string; date: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

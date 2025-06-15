// Service helpers for managing user habits
// Combines token retrieval with API client calls

import { getToken } from './authUtils';
import { postHabit, getHabits, logHabit, deleteHabit } from './apiClient';

// Persist a new habit for the logged-in user
export async function saveHabit(habit_name: string, frequency: string, userId: number) {
  const token = getToken();
  if (!token) {
    // Require authentication before saving the habit
    throw new Error('User not authenticated');
  }
  const data = await postHabit({ habit_name, frequency, user_id: userId }, token);
  return data as { id: number; habit_name: string; frequency: string };
}

// Retrieve all habits for the current user
export async function fetchHabits(userId: number) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  const data = await getHabits(userId, token);
  return data as Array<{ id: number; habit_name: string; frequency: string; streak_count: number }>;
}

// Log a habit occurrence and return the updated record
export async function logUserHabit(habitId: number) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  const data = await logHabit(habitId, token);
  return data as { id: number; streak_count: number };
}

// Delete a habit by its ID
export async function removeHabit(habitId: number) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  await deleteHabit(habitId, token);
}

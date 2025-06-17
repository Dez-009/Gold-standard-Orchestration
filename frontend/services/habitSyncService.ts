// Helpers for syncing and retrieving habit metrics

import { getToken } from './authUtils';
import { postHabitSync, getHabitSummary } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface HabitData {
  id: string;
  steps: number;
  sleep_hours: number;
  active_minutes: number;
  synced_at: string;
}

// Trigger a new sync for the logged-in user
export async function addHabitSync(source: string) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await postHabitSync(token, { source });
    return data as HabitData;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Retrieve recent habit entries
export async function getHabitTrends(days = 7) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getHabitSummary(token, { days });
    return data as { steps: number; sleep_hours: number; active_minutes: number };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Footnote: Frontend service layer for habit sync operations.

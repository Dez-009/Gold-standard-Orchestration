// Service wrapper to fetch user login sessions from the backend

import { getToken } from './authUtils';
import { getUserSessions } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface UserSessionRecord {
  user_id: number;
  session_start: string;
  session_end: string | null;
  total_duration: string | null;
}

// Retrieve session history ensuring the user is authenticated and an admin
export async function fetchUserSessions() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getUserSessions(token);
    return data as UserSessionRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

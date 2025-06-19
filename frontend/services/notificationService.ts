// Service wrapper for admin notification management

import { getToken } from './authUtils';
import { getNotifications, retryNotification } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

export interface NotificationRecord {
  id: number;
  user_id: number;
  type: string;
  channel: string | null;
  message: string;
  status: string;
  created_at: string;
  sent_at: string | null;
}

// Fetch all notifications from the backend
export async function fetchNotifications() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getNotifications(token);
    return data as NotificationRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Retry sending a failed notification by id
export async function retryFailedNotification(id: string) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    await retryNotification(id, token);
    showSuccess('Saved successfully');
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

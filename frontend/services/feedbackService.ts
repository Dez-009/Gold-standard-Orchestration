// Service wrapper for submitting and retrieving feedback

import { getToken, isAdmin } from './authUtils';
import { submitFeedback as apiSubmitFeedback, getAdminFeedback } from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

// Send a feedback message to the backend
export async function sendFeedback(type: string, message: string) {
  const token = getToken();
  try {
    // Notes: Call the API client with optional auth token
    const data = await apiSubmitFeedback({ feedback_type: type, message }, token || undefined);
    showSuccess('Feedback submitted');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Fetch feedback entries for admin users
export async function fetchAdminFeedback(params?: { feedback_type?: string; limit?: number; offset?: number }) {
  const token = getToken();
  if (!token || !isAdmin()) {
    // Notes: Only admins can request feedback listings
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve feedback records from the backend
    const data = await getAdminFeedback(token, params);
    return data as Record<string, unknown>[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

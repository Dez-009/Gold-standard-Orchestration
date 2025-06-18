// Service wrapper for admin feedback alerts

import { getToken } from './authUtils';
import { getFeedbackAlerts } from './apiClient';
import { showError } from '../components/ToastProvider';

// Retrieve alerts using stored JWT token
export async function fetchFeedbackAlerts() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getFeedbackAlerts(token);
    return data as Array<{
      id: string;
      user_id: number;
      summary_id: string;
      rating: number;
      flagged_reason: string | null;
      created_at: string;
      summary_preview: string;
    }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Footnote: Additional admin actions will be added later.

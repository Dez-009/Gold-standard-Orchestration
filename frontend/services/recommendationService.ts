// Service for triggering batch goal recommendations by segment

import { getToken, isAdmin } from './authUtils';
import { triggerGoalRecommendations } from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

// Kick off goal generation for a given segment id
export async function triggerSegmentRecommendations(segmentId: string) {
  const token = getToken();
  if (!token || !isAdmin()) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    await triggerGoalRecommendations(token, segmentId);
    showSuccess('Saved successfully');
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

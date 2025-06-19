// Service wrapper for admin feedback analytics

import { getToken } from './authUtils';
import { getFeedbackSummary } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface AgentFeedbackSummary {
  likes: number;
  dislikes: number;
  average_rating: number;
  flagged: number;
}

export type FeedbackSummaryResponse = Record<string, AgentFeedbackSummary>;

// Fetch aggregated metrics using stored JWT token
export async function fetchFeedbackSummary() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getFeedbackSummary(token);
    return data as FeedbackSummaryResponse;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

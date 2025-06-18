// Service wrapper for flag reason analytics

import { getToken } from './authUtils';
import { getFlagReasonAnalytics } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface FlagReasonUsage {
  reason: string;
  count: number;
}

// Fetch aggregated usage optionally filtered by date range
export async function fetchFlagReasonAnalytics(
  startDate?: string,
  endDate?: string
) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getFlagReasonAnalytics(token, startDate, endDate);
    return data as FlagReasonUsage[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

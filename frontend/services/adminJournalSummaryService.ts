// Service wrapper for retrieving summarized journals for admins

import { getToken, isAdmin } from './authUtils';
import { getSummarizedJournals } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface SummarizedJournalRecord {
  id: string;
  user_id: number;
  summary_text: string;
  created_at: string;
}

// Fetch summarized journals optionally filtered by user id
export async function fetchSummarizedJournals(user_id?: number) {
  const token = getToken();
  if (!token || !isAdmin()) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getSummarizedJournals(token, { user_id });
    return data as SummarizedJournalRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Footnote: Used by the admin journal summary page to display records.

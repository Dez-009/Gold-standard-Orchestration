// Service wrapper for retrieving summarized journals for admins

import { getToken, isAdmin } from './authUtils';
import {
  getSummarizedJournals,
  getAdminJournalSummary,
  updateAdminNotes
} from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

export interface SummarizedJournalRecord {
  id: string;
  user_id: number;
  summary_text: string;
  created_at: string;
  admin_notes?: string;
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

// Retrieve a single summary record for editing
export async function fetchSummary(summaryId: string) {
  const token = getToken();
  if (!token || !isAdmin()) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAdminJournalSummary(token, summaryId);
    return data as SummarizedJournalRecord;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Submit admin notes for the specified summary
export async function provideNotes(summaryId: string, notes: string) {
  const token = getToken();
  if (!token || !isAdmin()) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    await updateAdminNotes(token, summaryId, notes);
    showSuccess('Notes saved');
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Footnote: Used by the admin journal summary page to display records.

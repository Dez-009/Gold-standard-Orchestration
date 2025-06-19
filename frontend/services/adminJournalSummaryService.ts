// Service wrapper for retrieving summarized journals for admins

import { getToken, isAdmin } from './authUtils';
import {
  getSummarizedJournals,
  getAdminJournalSummary,
  updateAdminNotes,
  rerunSummary
} from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

export interface SummarizedJournalRecord {
  id: string;
  user_id: number;
  summary_text: string;
  created_at: string;
  admin_notes?: string;
  flagged?: boolean;
  flag_reason?: string | null;
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

// Trigger a rerun of the summarization agent for the specified record
// Usage: await triggerRerun(summaryId)
export async function triggerRerun(summaryId: string) {
  const token = getToken();
  if (!token || !isAdmin()) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    await rerunSummary(token, summaryId);
    showSuccess('Agent rerun complete');
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Footnote: Used by the admin journal summary page to display records.

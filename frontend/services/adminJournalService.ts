// Service wrapper for retrieving journal entries for admins
import { getToken, isAdmin } from './authUtils';
import { getAdminJournals } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface AdminJournalRecord {
  id: number;
  user_id: number;
  title: string | null;
  content: string;
  created_at: string;
  ai_generated: boolean;
}

export async function fetchAdminJournals(params: { user_id?: number; ai_only?: boolean } = {}) {
  const token = getToken();
  if (!token || !isAdmin()) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  const data = await getAdminJournals(token, params);
  return data as AdminJournalRecord[];
}


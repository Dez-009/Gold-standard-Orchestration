// Service wrapper for conflict flag API endpoints

import { getToken } from './authUtils';
import { getConflictFlags, resolveConflictFlag } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface ConflictFlag {
  id: string;
  user_id: number;
  journal_id: number | null;
  conflict_type: string;
  summary_excerpt: string;
  resolution_prompt: string;
  resolved: boolean;
  created_at: string;
}

// Fetch all conflict flags for the logged-in user
export async function getUserConflictFlags(userId: string) {
  const token = getToken();
  if (!token) throw new Error('User not authenticated');
  try {
    const data = await getConflictFlags(userId, token);
    return data as ConflictFlag[];
  } catch {
    showError('Failed to load conflicts');
    throw new Error('Request failed');
  }
}

// Mark a conflict flag as resolved via the API
export async function resolveFlag(flagId: string) {
  const token = getToken();
  if (!token) throw new Error('User not authenticated');
  try {
    const data = await resolveConflictFlag(flagId, token);
    return data as ConflictFlag;
  } catch {
    showError('Failed to resolve flag');
    throw new Error('Request failed');
  }
}

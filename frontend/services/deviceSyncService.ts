// Service helper for fetching device synchronization logs

import { getToken } from './authUtils';
import { getDeviceSyncLogs } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface DeviceSyncRecord {
  id: string;
  user_id: number;
  source: string;
  sync_status: string;
  synced_at: string;
  raw_data_preview: unknown;
}

// Notes: Retrieve sync log data using stored JWT
export async function fetchLogs(limit = 20, offset = 0) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getDeviceSyncLogs(token, { limit, offset });
    return data as DeviceSyncRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Footnote: Provides typed wrapper for wearable sync history retrieval.

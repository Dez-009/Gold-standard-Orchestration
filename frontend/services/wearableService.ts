// Service wrapper for admin wearable synchronization metrics

import { getToken } from './authUtils';
import { getWearableSyncLogs } from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape describing a single wearable sync log entry
export interface WearableSyncRecord {
  id: string;
  user_id: number;
  device_type: string;
  sync_status: string;
  synced_at: string;
  raw_data_url: string | null;
}

// Fetch wearable sync logs for the admin metrics dashboard
export async function fetchWearableSyncLogs(limit = 20, offset = 0) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getWearableSyncLogs(token, limit, offset);
    return data as WearableSyncRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Footnote: Allows admin pages to visualize wearable data ingestion.

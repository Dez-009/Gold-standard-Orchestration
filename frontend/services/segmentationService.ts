// Service layer for interacting with admin user segments

import { getToken } from './authUtils';
import {
  getSegments as apiGetSegments,
  createSegment as apiCreateSegment,
  updateSegment as apiUpdateSegment,
  deleteSegment as apiDeleteSegment,
  evaluateSegment as apiEvaluateSegment
} from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Fetch all segments for the admin page
export async function fetchSegments() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await apiGetSegments(token);
    return data as UserSegment[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Create a new segment and return it
export async function createSegment(payload: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await apiCreateSegment(payload, token);
    showSuccess('Saved successfully');
    return data as { id: string; name: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Update an existing segment by id
export async function updateSegment(id: string, payload: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await apiUpdateSegment(id, payload, token);
    showSuccess('Saved successfully');
    return data as { id: string; name: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Delete a segment by id
export async function removeSegment(id: string) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    await apiDeleteSegment(id, token);
    showSuccess('Saved successfully');
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Evaluate a segment and return matching users
export async function fetchSegmentUsers(id: string) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await apiEvaluateSegment(id, token);
    return data as Array<{ id: number; email: string; role: string }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

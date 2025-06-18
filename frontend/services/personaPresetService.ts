/**
 * Helpers for managing persona presets via the backend API.
 * Traits from a preset can be injected into prompts to tune agent tone.
 */

import { getToken } from './authUtils';
import {
  getPersonaPresets,
  createPersonaPreset,
  updatePersonaPreset,
  deletePersonaPreset
} from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

// Fetch all persona presets
export async function fetchPersonaPresets() {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    const data = await getPersonaPresets(token);
    return data as any[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Save a new persona preset
export async function savePersonaPreset(preset: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await createPersonaPreset(token, preset);
    showSuccess('Saved successfully');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Update an existing preset
export async function modifyPersonaPreset(id: string, preset: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await updatePersonaPreset(token, id, preset);
    showSuccess('Saved successfully');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Delete a preset
export async function removePersonaPreset(id: string) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await deletePersonaPreset(token, id);
    showSuccess('Deleted');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Footnote: Traits are injected into agent prompts for customization.


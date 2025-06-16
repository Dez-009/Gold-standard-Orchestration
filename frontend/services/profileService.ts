// Service wrapping profile-related API calls
// Provides helpers to fetch and update the user's profile

import { getToken } from './authUtils';
import {
  getProfile,
  updateProfile,
  getUserProfile,
  updateUserProfile as updateUserProfileRequest
} from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Retrieve the authenticated user's profile
export async function fetchProfile() {
  const token = getToken();
  if (!token) {
    // Throw an error when there is no token available
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Fetch profile data from the backend
    const data = await getProfile(token);
    showSuccess('Saved successfully');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Persist profile changes for the current user
export async function saveProfile(profileData: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    // Propagate an auth error if the user is not logged in
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Persist updated profile information
    const data = await updateProfile(profileData, token);
    showSuccess('Saved successfully');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Fetch the currently authenticated user's profile without triggering toasts
export async function fetchUserProfile() {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  // Return the profile data from the backend
  const data = await getUserProfile(token);
  return data as Record<string, unknown>;
}

// Update the user's profile and return the updated payload
export async function updateUserProfile(data: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  // Forward the update request to the API layer
  const result = await updateUserProfileRequest(data, token);
  return result as Record<string, unknown>;
}

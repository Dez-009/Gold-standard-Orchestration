// Service wrapping profile-related API calls
// Provides helpers to fetch and update the user's profile

import { getToken } from './authUtils';
import { getProfile, updateProfile } from './apiClient';

// Retrieve the authenticated user's profile
export async function fetchProfile() {
  const token = getToken();
  if (!token) {
    // Throw an error when there is no token available
    throw new Error('User not authenticated');
  }
  // Delegate the HTTP GET call to the API client
  const data = await getProfile(token);
  return data as Record<string, unknown>;
}

// Persist profile changes for the current user
export async function saveProfile(profileData: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    // Propagate an auth error if the user is not logged in
    throw new Error('User not authenticated');
  }
  // Send the updated profile to the backend
  const data = await updateProfile(profileData, token);
  return data as Record<string, unknown>;
}

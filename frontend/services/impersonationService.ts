// Service helpers for the admin impersonation feature
// Provides simplified functions for fetching users and issuing impersonation tokens

import { getToken, isAdmin } from './authUtils';
import {
  getUsersForImpersonation,
  createImpersonationToken
} from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape of a user record returned by the impersonation list endpoint
export interface ImpersonationUser {
  id: number;
  email: string;
}

// Retrieve the list of users that an admin can impersonate
export async function fetchUsers() {
  const token = getToken();
  if (!token || !isAdmin()) {
    // Notes: Only admins should be able to call this function
    throw new Error('User not authenticated');
  }
  try {
    const data = await getUsersForImpersonation(token);
    return data as ImpersonationUser[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Request an impersonation token for the chosen user id
// Stores the returned token in localStorage for subsequent requests
export async function impersonateUser(userId: number) {
  const token = getToken();
  if (!token || !isAdmin()) {
    throw new Error('User not authenticated');
  }
  try {
    const data = await createImpersonationToken(userId, token);
    localStorage.setItem('token', data.token as string);
    return data.token as string;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Service layer for admin user management

import { getToken } from './authUtils';
import { getUsers, updateUserRole, deactivateUser } from './apiClient';
import { showError } from '../components/ToastProvider';

export async function fetchUsers(filters: Record<string, unknown> = {}) {
  const token = getToken();
  if (!token) throw new Error('Unauthenticated');
  try {
    return (await getUsers(token, filters)) as any[];
  } catch (err) {
    showError('Failed to load users');
    throw err;
  }
}

export async function changeUserRole(userId: number, newRole: string) {
  const token = getToken();
  if (!token) throw new Error('Unauthenticated');
  try {
    return await updateUserRole(token, String(userId), newRole);
  } catch (err) {
    showError('Failed to update role');
    throw err;
  }
}

export async function disableUser(userId: number) {
  const token = getToken();
  if (!token) throw new Error('Unauthenticated');
  try {
    return await deactivateUser(token, String(userId));
  } catch (err) {
    showError('Failed to deactivate user');
    throw err;
  }
}

// Notes: Helper functions related to overall system health
import { getToken } from './authUtils';
import { getSystemHealth, postRenewalReminders, postSubscriptionSync } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Notes: Fetch health details for API, database and AI service
export async function fetchSystemHealth() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getSystemHealth(token);
    showSuccess('Saved successfully');
    return data as { api: string; database: string; ai: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Manually synchronize subscription data from Stripe
export async function triggerSubscriptionSync() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    await postSubscriptionSync(token);
    showSuccess('Saved successfully');
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Trigger upcoming subscription renewal reminder processing
export async function triggerRenewalReminders() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    await postRenewalReminders(token);
    showSuccess('Saved successfully');
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

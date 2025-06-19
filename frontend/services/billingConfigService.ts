// Service wrapper for loading and updating billing settings for the admin page
// Combines token retrieval with the API client calls and toast handling

import { getToken } from './authUtils';
import {
  getBillingConfig,
  updateBillingConfig as updateBillingConfigApi
} from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Shape of the billing configuration returned by the backend
export interface BillingConfig {
  stripe_public_key: string;
  webhook_active: boolean;
  plans: Array<{ name: string; price: number }>;
  currency: string;
  tax_rate?: number | null;
}

// Retrieve the billing configuration ensuring the admin is authenticated
export async function fetchBillingConfig() {
  const token = getToken();
  if (!token) {
    // Notes: Display an error when the token is missing
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the billing configuration from the backend
    const data = await getBillingConfig(token);
    showSuccess('Saved successfully');
    return data as BillingConfig;
  } catch (err) {
    // Notes: Surface any errors to the caller after showing a toast
    showError('Something went wrong');
    throw err;
  }
}

// Persist updated billing configuration values to the backend
export async function updateBillingConfig(data: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Send the updated configuration to the backend
    const resp = await updateBillingConfigApi(data, token);
    showSuccess('Saved successfully');
    return resp as BillingConfig;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

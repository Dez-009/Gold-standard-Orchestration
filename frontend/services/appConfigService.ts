// Service for loading and updating the application configuration
// Combines token retrieval with API client calls used by admin pages

import { getToken } from './authUtils';
import { getAppConfig, updateAppConfig as updateAppConfigApi } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Retrieve the application configuration from the backend
export async function fetchAppConfig() {
  const token = getToken();
  if (!token) {
    // Notes: Throw when no authentication token is present
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the configuration object via the API client
    const data = await getAppConfig(token);
    showSuccess('Saved successfully');
    return data as {
      feature_flags: Record<string, boolean>;
      openai_key_loaded: boolean;
      environment: string;
      version: string;
    };
  } catch (err) {
    // Notes: Propagate errors to the caller after showing a toast
    showError('Something went wrong');
    throw err;
  }
}

// Persist updated configuration values to the backend
export async function updateAppConfig(data: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Send the updated config object to the API
    const resp = await updateAppConfigApi(data, token);
    showSuccess('Saved successfully');
    return resp as {
      feature_flags: Record<string, boolean>;
      openai_key_loaded: boolean;
      environment: string;
      version: string;
    };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

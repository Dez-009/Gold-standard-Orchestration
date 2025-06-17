// High level wrapper for logging analytics events

import { getToken } from './authUtils';
import { postAnalyticsEvent } from './apiClient';

export async function trackEvent(eventType: string, payload: Record<string, unknown>) {
  // Notes: Retrieve token if the user is authenticated
  const token = getToken();
  try {
    // Notes: Forward the event to the API client
    await postAnalyticsEvent(token, eventType, payload);
  } catch {
    // Silently ignore tracking errors to avoid impacting UX
  }
}

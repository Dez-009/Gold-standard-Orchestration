// Service for user-facing billing operations
// Provides helpers to fetch pricing plans and initiate Stripe Checkout

import { getToken } from './authUtils';
import {
  getPricingPlans,
  createCheckoutSession as createCheckoutSessionApi,
  createBillingPortalSession as createBillingPortalSessionApi
} from './apiClient';
import { showError } from '../components/ToastProvider';

// Shape of a pricing plan returned by the backend
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

// Retrieve available subscription plans for the current user
export async function fetchPricingPlans() {
  const token = getToken();
  if (!token) {
    // Notes: Caller must handle authentication failures
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate HTTP request to the API client helper
    const data = await getPricingPlans(token);
    return data as PricingPlan[];
  } catch (err) {
    // Notes: Show a toast and rethrow so the page can react
    showError('Something went wrong');
    throw err;
  }
}

// Create a new Stripe Checkout session for the given plan id
export async function createCheckoutSession(planId: string) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    // Notes: API call returns { url: string } for redirect
    const data = await createCheckoutSessionApi(planId, token);
    return data as { url: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Request a billing portal session from the backend
// Notes: Allows the authenticated user to manage their subscription
export async function createBillingPortalSession() {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    // Notes: API returns { url: string } for redirect to Stripe portal
    const data = await createBillingPortalSessionApi(token);
    return data as { url: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

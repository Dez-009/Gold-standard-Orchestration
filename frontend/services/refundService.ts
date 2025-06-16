// Service wrapping admin refund API calls
// Provides helpers to fetch recent payments and issue refunds

import { getToken } from './authUtils';
import { getRecentPayments, refundPayment } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Shape of a payment record returned from the backend
export interface PaymentRecord {
  charge_id: string;
  email: string | null;
  amount: number;
  created: number;
}

// Retrieve recent payment data for the admin refunds page
export async function fetchRecentPayments() {
  const token = getToken();
  if (!token) {
    // Notes: Caller is responsible for handling authentication failures
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Delegate the HTTP request to the API client
    const data = await getRecentPayments(token);
    return data as PaymentRecord[];
  } catch (err) {
    // Notes: Surface a user-friendly toast message on error
    showError('Something went wrong');
    throw err;
  }
}

// Request a refund for the provided charge id
export async function issueRefund(chargeId: string) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    await refundPayment(chargeId, token);
    // Notes: Notify the admin that the refund succeeded
    showSuccess('Refund processed');
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}


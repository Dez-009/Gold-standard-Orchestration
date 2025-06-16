// Service providing a wrapper around support ticket API operations
// Notes: Handles token retrieval and toast notifications so pages only import one helper

import { getToken } from './authUtils';
import { submitSupportTicket } from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Submit a new support request from the logged-in user
export async function submitTicket(
  subject: string,
  category: string,
  message: string
) {
  // Retrieve the JWT token stored in the browser
  const token = getToken();
  if (!token) {
    // Notes: Prevent submission when no user is authenticated
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Call the API client helper to send the ticket details
    const data = await submitSupportTicket({ subject, category, message }, token);
    showSuccess('Saved successfully');
    // Return the newly created ticket object
    return data as { id: number; subject: string; category: string; message: string };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

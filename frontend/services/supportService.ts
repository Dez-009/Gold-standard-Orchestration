// Service providing a wrapper around support ticket API operations
// Notes: Handles token retrieval and toast notifications so pages only import one helper

import { getToken } from './authUtils';
import {
  submitSupportTicket,
  getSupportTickets,
  updateSupportTicketStatus
} from './apiClient';
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

// Fetch all support tickets for admin management
export async function fetchSupportTickets() {
  // Retrieve the authentication token from localStorage
  const token = getToken();
  if (!token) {
    // Notes: Throw when no authenticated user is present
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the ticket list via the API client
    const data = await getSupportTickets(token);
    showSuccess('Saved successfully');
    return data as Array<{
      id: number;
      user_email: string;
      category: string;
      subject: string;
      status: string;
      created_at: string;
    }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Update the status field of a specific support ticket
export async function updateTicketStatus(ticketId: number, status: string) {
  // Obtain the JWT token so the backend can authorize the request
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Send the new status through the API client helper
    const data = await updateSupportTicketStatus(ticketId, status, token);
    showSuccess('Saved successfully');
    return data as {
      id: number;
      user_email: string;
      category: string;
      subject: string;
      status: string;
      created_at: string;
    };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Service for retrieving journal history for the logged-in user
// Relies on authUtils to fetch the stored JWT token and delegates
// the network request to apiClient.
import { getToken } from './authUtils';
import {
  getJournalEntries,
  getJournalHistory,
  getAllJournals,
  getJournalById,
  updateJournal as updateJournalApi
} from './apiClient';
import { showSuccess, showError } from '../components/ToastProvider';

// Fetch all journal entries belonging to the authenticated user
// Throws an error if no token is available in localStorage.
export async function fetchJournalEntries() {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error so the caller can handle it
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve journal entries from the backend
    const data = await getJournalEntries(token);
    showSuccess('Saved successfully');
    return data as Array<{ id: number; content: string; created_at: string }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Fetch previous journal entries specifically for the history page
// Mirrors fetchJournalEntries but uses the dedicated API client function
export async function fetchJournalHistory() {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error so the caller can handle it
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve journal history from the backend
    const data = await getJournalHistory(token);
    return data as Array<{ id: number; content: string; created_at: string }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Fetch every journal entry via the plural /journals API
// Useful for the dedicated journal list page
export async function fetchAllJournals() {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error so the caller can handle it
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request all journal entries from the backend service
    const data = await getAllJournals(token);
    return data as Array<{
      id: number;
      title: string | null;
      content: string;
      created_at: string;
    }>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Fetch a single journal entry using its unique id
// Throws an authentication error when no token is stored
export async function fetchJournalById(id: string) {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error to the caller
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Retrieve the journal entry from the backend service
    const data = await getJournalById(id, token);
    // Notes: Cast the response to include the optional mood field
    return data as {
      id: number;
      title: string | null;
      content: string;
      created_at: string;
      mood?: string | null;
    };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Persist updates to an existing journal entry
// Returns the updated entry from the backend
export async function updateJournal(
  id: string,
  data: Record<string, unknown>
) {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error when no token is available
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Send updated journal data to the backend
    const updated = await updateJournalApi(id, data, token);
    showSuccess('Saved successfully');
    return updated as {
      id: number;
      title: string | null;
      content: string;
      created_at: string;
      mood?: string | null;
    };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

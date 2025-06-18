// Service for retrieving journal history for the logged-in user
// Relies on authUtils to fetch the stored JWT token and delegates
// the network request to apiClient.
import { getToken } from './authUtils';
import {
  getJournalEntries,
  getJournalHistory,
  getAllJournals,
  getJournalById,
  createJournalEntry as createJournalEntryApi,
  updateJournal as updateJournalApi,
  exportJournals as exportJournalsApi,
  getJournalTags
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
      ai_generated?: boolean;
    };
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Create a new journal entry using the API client helper
export async function createJournalEntry(data: Record<string, unknown>) {
  const token = getToken();
  if (!token) {
    // Notes: Inform the caller when authentication is missing
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Persist the journal entry to the backend
    const created = await createJournalEntryApi(data, token);
    showSuccess('Saved successfully');
    return created as {
      id: number;
      title: string | null;
      content: string;
      created_at: string;
      linked_goal_id?: number | null;
      ai_generated?: boolean;
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

// Request a PDF export of all journals for the current user
export async function exportJournals() {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error so the caller can handle it
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Use the API client to fetch the PDF blob
    const blob = await exportJournalsApi(token);
    return blob;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Retrieve AI-generated tags summarizing the user's journals
export async function fetchJournalTags() {
  const token = getToken();
  if (!token) {
    // Propagate an authentication error so the caller can handle it
    throw new Error('User not authenticated');
  }
  try {
    // Notes: Request the tag list from the backend
    const data = await getJournalTags(token);
    return data.tags as string[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Axios instance configured for the backend API
// This wrapper centralizes all HTTP requests to the FastAPI backend
// so other services only need to import this file.
import axios from 'axios';
// Notes: Toast helper used to notify when the session has expired
import { showError } from '../components/ToastProvider';

// Create the Axios instance with baseURL from env variable or default
// This ensures we can point the frontend at different backend URLs
// depending on the deployment environment.
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
});

// Notes: Intercept responses to detect authentication issues
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Notes: Trigger logout when backend reports unauthorized access
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Send a prompt to the AI coach endpoint
// Includes the user's JWT token in the Authorization header
// Returns the JSON payload produced by the backend
export async function postAiPrompt(prompt: string, token: string) {
  // Issue the POST request to our API using the provided JWT token
  const response = await apiClient.post(
    '/vida/coach',
    { prompt },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Return the parsed response from the backend
  // The shape of this object is determined by the backend implementation
  return response.data;
}

// Retrieve all journal entries for the authenticated user
// Expects the caller to supply a valid JWT token that will be sent
// in the Authorization header of the request
export async function getJournalEntries(token: string) {
  // Issue the GET request to the /journal endpoint
  const response = await apiClient.get('/journal', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the JSON payload containing the list of entries
  return response.data;
}

// Retrieve previous journal entries for history view
// This performs the same GET request as getJournalEntries but uses a
// dedicated name so the caller semantics are clearer
export async function getJournalHistory(token: string) {
  // Issue the GET request to the /journal endpoint with auth header
  const response = await apiClient.get('/journal', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the list of entries returned by the backend
  return response.data;
}

// Save a new goal for the authenticated user
// Expects goal content and JWT token for authorization
export async function postGoal(content: string, token: string) {
  // Issue the POST request to the /goals endpoint with auth header
  const response = await apiClient.post(
    '/goals',
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Return the parsed JSON response from the backend
  return response.data;
}

// Retrieve all goals belonging to the authenticated user
// JWT token must be provided by the caller for authorization
export async function getGoals(token: string) {
  // Issue the GET request to the /goals endpoint with auth header
  const response = await apiClient.get('/goals', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the array of goals from the backend
  return response.data;
}

// Retrieve the latest weekly review for the authenticated user
// The caller must provide a valid JWT token for authorization
export async function getWeeklyReview(token: string) {
  // Issue the GET request to the /review endpoint with the auth header
  const response = await apiClient.get('/review', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the weekly review data returned by the backend
  return response.data;
}

// Submit a daily check-in for the authenticated user
// Expects a reflection text and mood value along with the JWT token
export async function postDailyCheckin(
  data: { reflection: string; mood: string },
  token: string
) {
  // Issue the POST request to the /checkin endpoint with auth header
  const response = await apiClient.post('/checkin', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the created check-in record from the backend
  return response.data;
}

// Retrieve the list of recent daily check-ins for the user
// Requires a valid JWT token supplied by the caller
export async function getDailyCheckins(token: string) {
  // Issue the GET request to the /checkin endpoint with auth header
  const response = await apiClient.get('/checkin', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the array of check-ins from the backend
  return response.data;
}

// Retrieve the current user's profile information
// Expects a valid JWT token for authorization
export async function getProfile(token: string) {
  // Perform GET request to the /profile endpoint with auth header
  const response = await apiClient.get('/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the user's profile data from the backend
  return response.data;
}

// Update the user's profile with the supplied data
// profileData should contain the editable profile fields
export async function updateProfile(
  profileData: Record<string, unknown>,
  token: string
) {
  // Issue PUT request to /profile including the authorization header
  const response = await apiClient.put('/profile', profileData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the updated profile payload from the backend
  return response.data;
}

// Retrieve subscription and billing info for the authenticated user
// Sends a GET request to the /account endpoint with the JWT token
export async function getAccountDetails(token: string) {
  // Issue the request to the backend account route
  const response = await apiClient.get('/account', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the account payload returned by the backend
  return response.data;
}

// Retrieve all previous coaching sessions for the logged-in user
// Sends a GET request to the /sessions endpoint with the JWT token
export async function getSessions(token: string) {
  // Issue the GET request to /sessions including auth header
  const response = await apiClient.get('/sessions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the list of sessions supplied by the backend
  return response.data;
}

// Retrieve AI-generated goal suggestions for the authenticated user
// Sends a GET request to the /ai/suggestions endpoint with auth header
export async function getAiSuggestions(token: string) {
  // Issue the request to the backend suggestions route
  const response = await apiClient.get('/ai/suggestions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the suggestion data provided by the backend
  return response.data;
}

// Retrieve all recent audit logs from the backend
// Sends a GET request to the /audit-logs endpoint with auth header
export async function getAuditLogs(token: string) {
  // Issue the request to fetch audit log entries
  const response = await apiClient.get('/audit-logs', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the array of audit log objects
  return response.data;
}

// Notes: Retrieve overall system health information
export async function getSystemHealth(token: string) {
  // Notes: Call the backend /health endpoint including auth header
  const response = await apiClient.get('/health', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the status payload for each service
  return response.data;
}

// Exporting the configured client lets other modules import a single instance
// instead of creating new Axios clients every time.
export default apiClient;

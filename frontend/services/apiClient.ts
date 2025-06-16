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

// Retrieve all journals using the plural /journals route
// Notes: This mirrors getJournalHistory but targets the new endpoint
export async function getAllJournals(token: string) {
  // Issue the GET request to the /journals endpoint including auth header
  const response = await apiClient.get('/journals', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the payload containing all journal entries
  return response.data;
}

// Retrieve a single journal entry by id
// Requires the caller to provide a valid JWT token for authorization
export async function getJournalById(id: string, token: string) {
  // Issue the GET request to `/journals/{id}` including auth header
  const response = await apiClient.get(`/journals/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the entry data returned by the backend
  return response.data;
}

// Update an existing journal entry
// Accepts the entry id, updated fields and the JWT token
export async function updateJournal(
  id: string,
  data: Record<string, unknown>,
  token: string
) {
  // Issue the PUT request to `/journals/${id}` including auth header
  const response = await apiClient.put(`/journals/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the updated entry data from the backend
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

// Retrieve progress information for all of the user's goals
// Sends a GET request to the /goals/progress endpoint with auth header
export async function getGoalProgress(token: string) {
  // Issue the GET request to the progress route including JWT token
  const response = await apiClient.get('/goals/progress', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the progress payload returned by the backend
  return response.data;
}

// Retrieve AI-powered goal suggestions from the backend
// Notes: Performs a GET request to /goals/suggestions including the JWT token
export async function getGoalSuggestions(token: string) {
  // Notes: Request the list of suggestions for the current user
  const response = await apiClient.get('/goals/suggestions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of suggested goals returned by the backend
  return response.data;
}

// Retrieve the weekly review summary for the authenticated user
// Notes: Performs a GET request to the new /weekly-review endpoint
export async function getWeeklyReview(token: string) {
  // Notes: Include the JWT token so the backend can authenticate the user
  const response = await apiClient.get('/weekly-review', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: The response data contains the aggregated summary information
  return response.data;
}

// Retrieve the list of completed goals for the authenticated user
// Notes: Performs a GET request to the /goals/history endpoint including auth header
export async function getCompletedGoals(token: string) {
  // Notes: Issue the request to fetch completed goal records
  const response = await apiClient.get('/goals/history', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of completed goals returned by the backend
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

// Retrieve today's check-in for the current user
// Returns null when no check-in has been submitted yet
export async function getDailyCheckIn(token: string) {
  // Issue the GET request to the /checkin endpoint using the auth header
  const response = await apiClient.get('/checkin', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: The backend responds with either the check-in or null
  return response.data;
}

// Submit today's check-in for the authenticated user
// Accepts reflection text and mood selection
export async function postDailyCheckIn(
  data: { reflection: string; mood: string },
  token: string
) {
  // Issue the POST request to the /checkin endpoint with auth header
  const response = await apiClient.post('/checkin', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the created check-in record from the backend
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

// Retrieve the current user's profile information using a descriptive name
// This wrapper mirrors getProfile but is named for clarity in the profile page
export async function getUserProfile(token: string) {
  // Perform GET request to the /profile endpoint with auth header
  const response = await apiClient.get('/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the user's profile data from the backend
  return response.data;
}

// Update the user's profile using a similarly descriptive function name
export async function updateUserProfile(
  data: Record<string, unknown>,
  token: string
) {
  // Issue the PUT request to the /profile endpoint with auth header
  const response = await apiClient.put('/profile', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the updated profile information
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

// Notes: Retrieve all recent audit logs from the backend
// Notes: Sends a GET request to the admin audit endpoint with auth header
export async function getAuditLogs(token: string) {
  // Notes: Issue the request to fetch audit log entries
  const response = await apiClient.get('/admin/audit', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of audit log objects
  return response.data;
}

// Retrieve the authenticated user's mood entry for the current day
export async function getMood(token: string) {
  // Issue the GET request to the /mood endpoint with auth header
  const response = await apiClient.get('/mood', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the mood payload returned by the backend
  return response.data;
}

// Submit or update today's mood for the current user
export async function postMood(mood: string, token: string) {
  // Issue the POST request to the /mood endpoint with auth header
  const response = await apiClient.post(
    '/mood',
    { mood },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Return the updated mood payload from the backend
  return response.data;
}

// Retrieve the full mood history for charting trends
export async function getMoodTrends(token: string) {
  // Issue the GET request to the /mood/trends endpoint with auth header
  const response = await apiClient.get('/mood/trends', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the array of mood records from the backend
  return response.data;
}

// Notes: Retrieve overall system health information for admin dashboard
export async function getSystemHealth(token: string) {
  // Notes: Call the backend /admin/health endpoint including auth header
  const response = await apiClient.get('/admin/health', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the status payload for each monitored service
  return response.data;
}

// Notes: Retrieve the list of all users for the admin user management page
// Notes: Performs a GET request to the /admin/users endpoint with auth header
export async function getAllUsers(token: string) {
  // Notes: Issue the request to the backend admin users route
  const response = await apiClient.get('/admin/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of user objects provided by the backend
  return response.data;
}

// Exporting the configured client lets other modules import a single instance
// instead of creating new Axios clients every time.
export default apiClient;

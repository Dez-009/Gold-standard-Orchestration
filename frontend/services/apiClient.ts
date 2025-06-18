/**
 * Axios client wrapper for communicating with the FastAPI backend.
 * All other frontend services rely on these helpers for network calls.
 * The helpers below also expose admin log retrieval functions so
 * dashboards can display recent system activity.
 * This file now also exposes a helper for downloading summary PDFs.
 * Additional helpers allow admins to manage agent toggles.
 */
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
  // Notes: Detect timeout error to allow UI retry logic
  if (response.data?.error === 'timeout') {
    // Optional: Could automatically retry here if desired
    return response.data;
  }
  // Return the parsed response from the backend
  // The shape of this object is determined by the backend implementation
  return response.data;
}

// Send a prompt to the agent orchestration route
// Notes: Includes the user's JWT token for authentication
export async function orchestrateAiRequest(prompt: string, token: string) {
  // Notes: Issue the POST request to the new orchestration endpoint
  const response = await apiClient.post(
    '/ai/orchestrate',
    { prompt },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return timeout error directly so caller can display banner
  if (response.data?.error === 'timeout') {
    return response.data;
  }
  // Notes: Return the backend payload containing agent and response
  return response.data;
}

// Send a prompt to the multi-agent orchestration endpoint
// Notes: Includes user_id so the backend can validate ownership
// Notes: Legacy helper used by the older multi-agent endpoint
export async function postLegacyOrchestrationPrompt(
  token: string,
  user_id: number,
  user_prompt: string
) {
  // Notes: Issue POST request carrying user_id and prompt
  const response = await apiClient.post(
    '/ai/orchestration',
    { user_id, user_prompt },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Surface timeout error so caller may display retry UI
  if (response.data?.error === 'timeout') {
    return response.data;
  }
  // Notes: Return the aggregated agent responses
  return response.data;
}

// Notes: New helper posting directly to the orchestration processor
export async function postOrchestrationPrompt(token: string, prompt: string) {
  // Notes: Issue the POST request with the user's prompt
  const response = await apiClient.post(
    '/orchestration/ask',
    { prompt },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (response.data?.error === 'timeout') {
    // Notes: Optional retry could be implemented here in the future
    return response.data;
  }
  // Notes: Return the unified response text from the backend
  return response.data as { response: string };
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

// Export all journals to a PDF file
// Notes: Returns the raw Blob that can be used for download
export async function exportJournals(token: string) {
  // Issue the GET request to the export route with responseType 'blob'
  const response = await apiClient.get('/journals/export', {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  });
  // Provide the binary PDF blob back to the caller
  return response.data as Blob;
}

// Download a single journal summary as a PDF
// Notes: Returns the Blob so the caller can trigger a file download
export async function downloadSummaryPDF(token: string, summaryId: string) {
  // Issue the GET request to the new export route
  const response = await apiClient.get(`/summaries/${summaryId}/export-pdf`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  });
  // Notes: Provide the raw PDF blob back to the caller
  return response.data as Blob;
}

// Retrieve AI-generated tags summarizing the user's journal themes
// Notes: Performs a GET request to /journals/analyze-tags with JWT token
export async function getJournalTags(token: string) {
  // Issue the request to analyze journal tags
  const response = await apiClient.get('/journals/analyze-tags', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the JSON payload containing the list of tags
  return response.data as { tags: string[] };
}

// Create a new journal entry for the authenticated user
export async function createJournalEntry(
  data: Record<string, unknown>,
  token: string
) {
  // Send a POST request to the /journals endpoint
  const response = await apiClient.post('/journals', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the newly created entry from the backend
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

// Submit existing goals and journal tags for AI refinement
// Notes: Performs a POST request to /goals/suggest-refined with JWT token
export async function refineGoals(
  token: string,
  payload: { existing_goals: string[]; journal_tags: string[] }
) {
  const response = await apiClient.post('/goals/suggest-refined', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Response contains a list of refined goal strings
  return response.data as { refined_goals: string[] };
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

// Retrieve the progress report for the authenticated user
// Notes: Performs a GET request to the /ai/progress-report endpoint
export async function getProgressReport(token: string) {
  // Notes: Send the request including the JWT token for authentication
  const response = await apiClient.get('/ai/progress-report', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the progress report text provided by the backend
  return response.data;
}

// Retrieve the AI-generated journal summary for the authenticated user
// Notes: Performs a GET request to the /ai/journal-summary endpoint
export async function getJournalSummary(token: string) {
  // Notes: Issue the request with the Authorization header
  const response = await apiClient.get('/ai/journal-summary', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the summary with execution metadata
  return response.data as {
    summary: string;
    retry_count: number;
    timeout_occurred: boolean;
  };
}

// Submit a request to create a new journal summary via orchestration pipeline
// Notes: Sends POST request to /orchestration/journal-summary with user id
export async function postJournalSummary(token: string, user_id: string) {
  const response = await apiClient.post(
    '/orchestration/journal-summary',
    { user_id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the summary text generated by the backend along with flags
  return response.data as {
    summary: string;
    retry_count: number;
    timeout_occurred: boolean;
  };
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

// Submit a health check-in using the new /checkins endpoint
export async function submitCheckin(token: string, data: unknown) {
  // Notes: Issue POST to /checkins with authorization header
  const response = await apiClient.post('/checkins', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve all health check-ins for the current user
export async function fetchCheckins(token: string) {
  // Notes: Send GET request to /checkins with JWT token
  const response = await apiClient.get('/checkins', {
    headers: { Authorization: `Bearer ${token}` }
  });
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

// Notes: Retrieve audit log history for administrators
// Notes: Sends a GET request to the /admin/audit-logs endpoint
export async function getAuditLogs(
  token: string,
  filters: Record<string, unknown>
) {
  // Notes: Issue the HTTP request with filter parameters
  const response = await apiClient.get('/admin/audit-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });
  // Notes: Return the array of log objects from the backend
  return response.data;
}

// Notes: Retrieve orchestration performance logs for administrator view
export async function getOrchestrationLogs(
  token: string,
  limit = 100,
  skip = 0
) {
  // Notes: Issue GET request with pagination parameters
  const response = await apiClient.get('/admin/orchestration-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit, skip }
  });
  // Notes: Return the resulting log array
  return response.data;
}

// Notes: Retrieve orchestration logs using advanced filters
export async function getFilteredOrchestrationLogs(
  token: string,
  filters: Record<string, unknown>
) {
  const response = await apiClient.get('/admin/orchestration-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });
  return response.data;
}

// Notes: Export orchestration logs as CSV with the same filters
export async function exportOrchestrationLogsCSV(
  token: string,
  filters: Record<string, unknown>
) {
  const response = await apiClient.get('/admin/orchestration-logs/export', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters,
    responseType: 'blob'
  });
  return response.data as Blob;
}

// Notes: Retrieve agent lifecycle logs with optional filters
export async function getAgentLifecycleLogs(
  token: string,
  filters: {
    agent_name?: string;
    event_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }
) {
  // Notes: Issue GET request with query params for filtering
  const response = await apiClient.get('/admin/agent-lifecycle-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });
  // Notes: Return the array of lifecycle log objects
  return response.data;
}

// Notes: Retrieve agent execution logs with optional filters
export async function getAgentExecutionLogs(
  token: string,
  filters: {
    user_id?: number;
    agent_name?: string;
    success?: boolean;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }
) {
  // Notes: Issue GET request to the admin endpoint
  const response = await apiClient.get('/admin/agent-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });
  // Notes: Return the resulting log list
  return response.data;
}

// Notes: Retrieve agent scoring records with optional filters
export async function getAgentScores(
  token: string,
  filters: {
    agent_name?: string;
    user_id?: number;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }
) {
  // Notes: Perform GET request to the admin scores endpoint with params
  const response = await apiClient.get('/admin/agent-scores', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });
  // Notes: Response is the array of scoring entries
  return response.data;
}

// Notes: Retrieve agent self scoring entries for analytics
export async function getAgentSelfScores(
  token: string,
  agentName?: string,
  limit: number = 100
) {
  // Notes: Issue GET request to the self score admin endpoint
  const response = await apiClient.get('/admin/agent-self-scores', {
    headers: { Authorization: `Bearer ${token}` },
    params: { agent_name: agentName, limit }
  });
  // Notes: Return the array of self score objects
  return response.data;
}

// Notes: Retrieve current agent states for all users
export async function getAgentStates(
  token: string,
  limit?: number,
  offset?: number
) {
  // Notes: Perform GET request with optional pagination
  const response = await apiClient.get('/admin/agent-states', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit, offset }
  });
  // Notes: Return the array of agent state objects
  return response.data;
}

// Notes: Update the state of a specific agent record
export async function updateAgentState(token: string, payload: object) {
  // Notes: Send POST request with payload containing user_id, agent_name and state
  const response = await apiClient.post('/admin/agent-states/update', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the updated state record from the backend
  return response.data;
}

// Notes: Retrieve recent user login sessions for admins
export async function getUserSessions(token: string) {
  // Notes: Perform GET request to the /admin/user-sessions endpoint
  const response = await apiClient.get('/admin/user-sessions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the list of session records
  return response.data;
}

// Notes: Retrieve captured application error logs from the backend
// Notes: Sends GET request to the /admin/errors endpoint with auth header
export async function getErrorLogs(token: string) {
  // Notes: Perform the request to fetch error log entries
  const response = await apiClient.get('/admin/errors', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the list of error records provided by the backend
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

// Request aggregated journal trend insights for the authenticated user
export async function getJournalTrends(token: string) {
  // Notes: Perform GET request to the /ai/journal-trends endpoint
  const response = await apiClient.get('/ai/journal-trends', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the trend analysis data from the backend
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

// Retrieve system log records for administrators
// Sends a GET request to the /admin/system-logs endpoint
export async function getSystemLogs(token: string) {
  const response = await apiClient.get('/admin/system-logs', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the array of log entries from the backend
  return response.data;
}

// Check whether debug banners should be displayed in the admin UI
export async function getDebugMode(token: string): Promise<{ debug: boolean }> {
  // Send GET request to the debug status endpoint with auth header
  const response = await apiClient.get('/admin/system/debug-status', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Response includes a boolean flag `debug`
  return response.data as { debug: boolean };
}

// Retrieve AI model performance logs for administrators
// Notes: Sends GET request to the /admin/model-logs endpoint
export async function getModelLogs(token: string) {
  const response = await apiClient.get('/admin/model-logs', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the list of model log records
  return response.data;
}

// Retrieve orchestration performance logs for the admin dashboard

// Trigger upcoming subscription renewal reminders
// Notes: Sends a POST request to the /admin/system/send_renewal_reminders endpoint
export async function postRenewalReminders(token: string) {
  const response = await apiClient.post('/admin/system/send_renewal_reminders', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Backend returns an empty response body on success
  return response.data;
}

// Trigger a manual subscription synchronization job
export async function postSubscriptionSync(token: string) {
  const response = await apiClient.post('/admin/system/sync_subscriptions', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: API responds with HTTP 200 and empty body when successful
  return response.data;
}
// Notes: Retrieve all user subscription records for admin view
// Notes: Sends GET request to /admin/subscriptions with auth header
export async function getAllSubscriptions(token: string) {
  // Notes: Perform the request to fetch every subscription entry
  const response = await apiClient.get('/admin/subscriptions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the list of subscriptions from the backend
  return response.data;
}

// Notes: Retrieve the full subscription history including past records
// Notes: Sends a GET request to the /admin/subscriptions/history endpoint
export async function getSubscriptionHistory(token: string) {
  // Notes: Issue the HTTP request with the JWT for authentication
  const response = await apiClient.get('/admin/subscriptions/history', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of history records from the backend
  return response.data;
}

// Notes: Retrieve reminder delivery logs for subscription renewals
// Notes: Sends GET request to the /admin/reminders/logs endpoint with auth header
export async function getReminderLogs(token: string) {
  // Notes: Perform the request to fetch log records from the backend
  const response = await apiClient.get('/admin/reminders/logs', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of reminder log objects
  return response.data;
}

// Notes: Retrieve churn risk scores for all users
export async function getChurnRisks(
  token: string,
  limit?: number,
  offset?: number
) {
  // Notes: Build optional pagination parameters
  const params: Record<string, number> = {};
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;

  // Notes: Perform GET request to the admin churn endpoint
  const response = await apiClient.get('/admin/churn', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  // Notes: Return the raw list of churn risk records
  return response.data;
}

// Notes: Trigger recalculation of churn scores via admin endpoint
export async function recalculateChurnScores(token: string) {
  const response = await apiClient.post('/admin/churn/recalculate', null, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Backend returns simple status payload
  return response.data;
}

// Notes: Retrieve churn score records for admin display
export async function getChurnScores(
  token: string,
  limit?: number,
  offset?: number
) {
  const params: Record<string, number> = {};
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;
  const response = await apiClient.get('/admin/churn/scores', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
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

// Retrieve all agent assignments for the admin panel
// Notes: Performs a GET request to the /admin/agents endpoint with auth header
export async function getAgentAssignments(token: string) {
  // Notes: Request the assignment list from the backend API
  const response = await apiClient.get('/admin/agents', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of assignments from the backend
  return response.data;
}

// Retrieve current agent overrides and base assignments
export async function getAgentOverrides(token: string) {
  // Notes: Issue a GET request to the admin override endpoint
  const response = await apiClient.get('/admin/agent-override', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Response includes both assignments and overrides
  return response.data;
}

// Persist a new override mapping a user to an agent
export async function setAgentOverride(
  token: string,
  payload: { user_id: number; agent_id: string }
) {
  // Notes: POST the override payload to the backend
  const response = await apiClient.post('/admin/agent-override', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the created override record
  return response.data;
}

// Notes: Retrieve admin list of agent assignments with optional pagination
export async function listAgentAssignments(
  token: string,
  limit?: number,
  offset?: number
) {
  // Notes: Build query parameters only when provided
  const params: Record<string, number> = {};
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;

  // Notes: Issue GET request to the new admin assignment endpoint
  const response = await apiClient.get('/admin/agent-assignments', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  // Notes: Return the array of assignment objects
  return response.data;
}

// Notes: Persist a manual agent assignment for a specific user
export async function assignAgentToUser(
  token: string,
  user_id: number,
  domain: string,
  assigned_agent: string
) {
  // Notes: POST the assignment details to the backend
  const response = await apiClient.post(
    '/admin/agent-assignments',
    { user_id, domain, assigned_agent },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the created assignment record
  return response.data;
}

// Notes: Retrieve high level system metrics for the admin dashboard
// Notes: Sends a GET request to the /admin/metrics endpoint with auth header
export async function getSystemMetrics(token: string) {
  // Notes: Issue the request to the backend metrics route
  const response = await apiClient.get('/admin/metrics', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the metrics payload supplied by the backend
  return response.data;
}

// Notes: Alternative name mirroring the backend service
// Performs the same GET request to retrieve system metrics
export async function fetchSystemMetrics(token: string) {
  const response = await apiClient.get('/admin/metrics', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Notes: Retrieve behavioral insights for a specific user
// Notes: Retrieve aggregated behavioral insights for the admin dashboard
export async function getBehavioralInsights(token: string) {
  const response = await apiClient.get('/admin/behavioral-insights', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the computed metrics from the backend
  return response.data;
}

// Retrieve all notifications for the admin notifications page
// Notes: Performs a GET request to the /admin/notifications endpoint
export async function getNotifications(token: string) {
  const response = await apiClient.get('/admin/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of notification objects
  return response.data;
}

// Trigger a retry for a specific notification id
// Notes: POSTs to /admin/notifications/{id}/retry with auth header
export async function retryNotification(id: string, token: string) {
  const response = await apiClient.post(
    `/admin/notifications/${id}/retry`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the backend acknowledgement payload
  return response.data;
}

// Retrieve the current application configuration for admins
// Sends a GET request to the /admin/config endpoint
export async function getAppConfig(token: string) {
  const response = await apiClient.get('/admin/config', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the configuration object from the backend
  return response.data;
}

// Update the application configuration
// Expects the new values and a valid JWT token
export async function updateAppConfig(
  data: Record<string, unknown>,
  token: string
) {
  const response = await apiClient.put('/admin/config', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Return the updated configuration from the backend
  return response.data;
}

// Retrieve the current billing configuration for the admin billing page
export async function getBillingConfig(token: string) {
  // Notes: Issue GET request to the /admin/billing endpoint
  const response = await apiClient.get('/admin/billing', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the configuration payload from the backend
  return response.data;
}

// Update billing configuration values via PUT request
export async function updateBillingConfig(
  data: Record<string, unknown>,
  token: string
) {
  const response = await apiClient.put('/admin/billing', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the updated configuration from the backend
  return response.data;
}

// Retrieve mapping of agents to required roles
export async function getAgentAccessRules(token: string) {
  const response = await apiClient.get('/admin/agent-access', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the list of rules from the backend
  return response.data;
}

// Notes: Retrieve a list of recent webhook events for administrators
export async function getRecentWebhooks(token: string) {
  // Notes: Issue GET request to the admin webhooks recent endpoint
  const response = await apiClient.get('/admin/webhooks/recent', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of webhook event objects
  return response.data;
}

// Notes: Trigger replay of a specific webhook event by id
export async function replayWebhook(eventId: string, token: string) {
  // Notes: POST the event identifier to the admin webhooks replay endpoint
  const response = await apiClient.post(
    '/admin/webhooks/replay',
    { event_id: eventId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return whatever status payload the backend provides
  return response.data;
}

// Retrieve available subscription plans and pricing
// Notes: Sends GET request to the /billing/plans endpoint with auth header
export async function getPricingPlans(token: string) {
  const response = await apiClient.get('/billing/plans', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the list of plans from the backend
  return response.data;
}

// Create a new Stripe Checkout session for the chosen plan
// Notes: Posts the plan identifier to /billing/checkout with JWT header
export async function createCheckoutSession(planId: string, token: string) {
  const response = await apiClient.post(
    '/billing/checkout',
    { plan_id: planId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Backend responds with the session details including redirect URL
  return response.data;
}

// Create a Stripe billing portal session so the user can manage billing
// Notes: Sends a GET request to /billing/portal with the JWT for auth
export async function createBillingPortalSession(token: string) {
  // Notes: Issue the GET request to the backend billing portal endpoint
  const response = await apiClient.get('/billing/portal', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the redirect URL to the hosted billing portal
  return response.data;
}

// Retrieve the current user's subscription status
// Notes: Sends GET request to the /billing/status endpoint with auth header
export async function getSubscriptionStatus(token: string) {
  const response = await apiClient.get('/billing/status', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the subscription details from the backend
  return response.data;
}

// Retrieve account information for the authenticated user
// Notes: Performs a GET request to the /account endpoint
export async function getAccountDetails(token: string) {
  // Notes: Send the authorization header with the stored JWT
  const response = await apiClient.get('/account', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the account details from the backend
  return response.data;
}

// Update account profile fields for the authenticated user
// Notes: Performs a PATCH request to /account/profile
export async function updateProfile(
  data: Record<string, unknown>,
  token: string
) {
  // Notes: Issue the PATCH request including the JWT token
  const response = await apiClient.patch('/account/profile', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the updated profile information
  return response.data;
}

// Retrieve recent successful payments for admin refunds
export async function getRecentPayments(token: string) {
  // Notes: Issue a GET request to the admin payments endpoint
  const response = await apiClient.get('/admin/billing/payments', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: The backend returns an array of payment objects
  return response.data;
}

// Submit a refund request for a specific charge id
export async function refundPayment(chargeId: string, token: string) {
  // Notes: POST the charge identifier to the refund endpoint
  const response = await apiClient.post(
    '/admin/billing/refund',
    { charge_id: chargeId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the status payload from the backend
  return response.data;
}

// Retrieve the list of users that an admin can impersonate
// Notes: Sends GET request to the admin impersonation users endpoint
export async function getUsersForImpersonation(token: string) {
  const response = await apiClient.get('/admin/impersonation/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Backend returns an array of minimal user objects
  return response.data;
}

// Request a short-lived token that allows acting as the specified user
// Notes: Posts the target user_id to the admin impersonation token endpoint
export async function createImpersonationToken(
  userId: number,
  token: string
) {
  const response = await apiClient.post(
    '/admin/impersonation/token',
    { user_id: userId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Response payload contains the new JWT token string
  return response.data;
}

// Submit a new support ticket on behalf of the authenticated user
// Notes: Sends a POST request to the /support/tickets endpoint
export async function submitSupportTicket(
  data: { subject: string; category: string; message: string },
  token: string
) {
  // Issue the request with the JWT token included in the headers
  const response = await apiClient.post('/support/tickets', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return whatever payload the backend responds with
  return response.data;
}

// Retrieve all submitted support tickets for administrators
// Notes: Sends a GET request to the /admin/support/tickets endpoint with auth
export async function getSupportTickets(token: string) {
  // Notes: Issue the request including the Authorization header
  const response = await apiClient.get('/admin/support/tickets', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of ticket objects from the backend
  return response.data;
}

// Update the status of a specific support ticket
// Notes: Performs a PATCH request to /admin/support/tickets/{id}
export async function updateSupportTicketStatus(
  ticketId: number,
  status: string,
  token: string
) {
  // Notes: Send the new status in the request body with auth header
  const response = await apiClient.patch(
    `/admin/support/tickets/${ticketId}`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the updated ticket payload from the backend
  return response.data;
}

// Request generation of a complete user data export
// Notes: Performs a GET request to the /account/export endpoint
export async function requestDataExport(token: string) {
  // Notes: Include the JWT token so the backend authorizes the export
  const response = await apiClient.get('/account/export', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the JSON payload containing the user's data snapshot
  return response.data;
}

// Assign a domain-specific AI agent to the authenticated user
export async function assignAgent(domain: string, token: string) {
  // Notes: POST the desired domain to the assignment endpoint
  const response = await apiClient.post(
    '/account/assign_agent',
    { domain },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the created assignment record from the backend
  return response.data;
}

// Send a natural language query to the admin agent API
export async function adminAgentQuery(token: string, user_prompt: string) {
  const response = await apiClient.post(
    '/admin/agent-query',
    { user_prompt },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return whatever structured payload the backend provides
  return response.data;
}

// Assign a personality specialization for the given domain
export async function assignPersonality(
  token: string,
  domain: string,
  personality: string
) {
  // Notes: POST request with domain and personality name
  const response = await apiClient.post(
    '/agent/personality-assignments',
    { domain, personality },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the assignment data from the backend
  return response.data;
}

// Retrieve current personality assignment for a domain
export async function getPersonalityAssignment(token: string, domain: string) {
  // Notes: GET request with domain as query parameter
  const response = await apiClient.get(
    `/agent/personality-assignments?domain=${encodeURIComponent(domain)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the assignment if found
  return response.data;
}

// Submit an analytics event to the backend
export async function postAnalyticsEvent(
  token: string | null,
  eventType: string,
  payload: Record<string, unknown>
) {
  // Notes: Build headers only when a token is provided
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.post(
    '/analytics/event',
    {
      event_type: eventType,
      event_payload: payload
    },
    { headers }
  );
  // Notes: Return the stored event record
  return response.data;
}

// Permanently delete the authenticated user's account
export async function deleteAccount(token: string) {
  // Notes: Send a DELETE request to the account deletion endpoint
  const response = await apiClient.delete('/account/delete', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Backend responds with empty body when successful
  return response.data;
}

// Retrieve aggregated analytics information for admin dashboards
export async function getAdminAnalyticsSummary(token: string) {
  // Notes: Perform GET request to the /admin/analytics/summary endpoint
  const response = await apiClient.get('/admin/analytics/summary', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the summary data structure
  return response.data;
}

// Retrieve revenue summary metrics for admin dashboards
export async function getRevenueSummary(token: string) {
  // Notes: Send GET request to the /admin/revenue/summary endpoint
  const response = await apiClient.get('/admin/revenue/summary', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the aggregated revenue data
  return response.data;
}

// Retrieve detailed revenue report for admin dashboards
export async function getRevenueReport(token: string) {
  // Notes: Send GET request to the /admin/revenue/report endpoint
  const response = await apiClient.get('/admin/revenue/report', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the full revenue report payload
  return response.data;
}

// Submit feedback on behalf of an authenticated or anonymous user
export async function submitFeedback(
  data: { feedback_type: string; message: string },
  token?: string
) {
  // Notes: Include auth header only when a token is supplied
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const response = await apiClient.post('/feedback/', data, { headers });
  // Notes: Return the stored feedback record
  return response.data;
}

// Interface describing payload for agent summary feedback
export interface AgentFeedbackPayload {
  summary_id: string;
  emoji_reaction: string;
  feedback_text?: string;
}

// Submit emoji reaction and optional comment for an agent summary
export async function postAgentSummaryFeedback(
  token: string,
  payload: AgentFeedbackPayload
) {
  const response = await apiClient.post('/feedback/agent-summary', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the created feedback record
  return response.data;
}

// Retrieve feedback for a specific summary id
export async function getAgentSummaryFeedback(token: string, summaryId: string) {
  const response = await apiClient.get(
    `/feedback/agent-summary/${summaryId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// Retrieve submitted feedback records for admin dashboards
export async function getAdminFeedback(
  token: string,
  params?: { feedback_type?: string; limit?: number; offset?: number }
) {
  // Notes: Perform GET request with query params and auth header
  const response = await apiClient.get('/admin/feedback', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
}

// Retrieve aggregated user feedback metrics for admin dashboard
export async function getFeedbackSummary(token: string) {
  const response = await apiClient.get('/admin/feedback/summary', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve summarized journal entries for admin review
export async function getSummarizedJournals(
  token: string,
  params?: { user_id?: string; limit?: number; offset?: number }
) {
  // Notes: Send GET request with optional filters and pagination
  const response = await apiClient.get('/admin/summarized-journals', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  // Notes: Return the array of summary records
  return response.data;
}

// Retrieve a single summarized journal for admin view
export async function getAdminJournalSummary(token: string, summaryId: string) {
  const response = await apiClient.get(
    `/admin/journal-summaries/${summaryId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the summary object including admin notes
  return response.data;
}

// Retrieve journal entries for admin dashboard
export async function getAdminJournals(
  token: string,
  params?: { user_id?: number; ai_only?: boolean; limit?: number; offset?: number }
) {
  // Notes: Issue GET request to admin journals endpoint with filters
  const response = await apiClient.get('/admin/journals', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
}

// Update admin notes associated with a summary
export async function updateAdminNotes(
  token: string,
  summaryId: string,
  notes: string
) {
  const response = await apiClient.patch(
    `/admin/journal-summaries/${summaryId}/notes`,
    { notes },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the updated summary payload
  return response.data;
}

// Retrieve the full note timeline for a summary
export async function getSummaryNotes(token: string, summaryId: string) {
  const response = await apiClient.get(
    `/admin/summaries/${summaryId}/notes`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// Append a new note to the summary
export async function addSummaryNote(
  token: string,
  summaryId: string,
  content: string
) {
  const response = await apiClient.post(
    `/admin/summaries/${summaryId}/notes`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

/**
 * Retrieve override history for a given user and agent.
 * Returns an array of override records from the backend.
 */
export async function getOverrideHistory(
  token: string,
  user_id: number,
  agent_name: string
) {
  const response = await apiClient.get('/admin/orchestration-override', {
    headers: { Authorization: `Bearer ${token}` },
    params: { user_id, agent_name }
  });
  return response.data;
}

/**
 * Trigger a manual override run for the specified summary.
 * The reason is logged for auditing purposes.
 */
export async function postOverrideRun(
  token: string,
  summaryId: string,
  reason: string
) {
  const response = await apiClient.post(
    `/admin/journal-summaries/${summaryId}/override`,
    { reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

/**
 * Trigger a rerun of the summarization agent for the specified summary.
 * Returns the updated summary record from the backend.
 */
export async function rerunSummary(token: string, summaryId: string) {
  const response = await apiClient.post(
    `/admin/journal-summaries/${summaryId}/rerun`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

/**
 * Retry a specific agent for the given summary.
 * Returns the new output string or throws on failure.
 */
export async function retryAgent(
  summaryId: string,
  agentName: string,
  token: string
) {
  try {
    const response = await apiClient.post(
      '/admin/agents/retry',
      { summary_id: summaryId, agent_name: agentName },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
    );
    return response.data as { output: string };
  } catch (err: any) {
    if (err.code === 'ECONNABORTED') {
      throw new Error('Request timed out');
    }
    throw err;
  }
}

 codex/implement-admin-audit-trail-viewer
/**
 * Retrieve the audit trail for a specific journal summary.
 */
export async function getSummaryAuditTrail(
  summaryId: string,
  token: string
) {
  try {
    const response = await apiClient.get(
      `/admin/summaries/${summaryId}/audit`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data as Array<{
      timestamp: string;
      event_type: string;
      actor: string | null;
      metadata: Record<string, unknown>;
    }>;
  } catch (err) {
    // Notes: Provide a fallback empty list on error
    console.error(err);
    return [];
  }

// ---------------------------------------------------------------------------
// Admin summary diff endpoint
// ---------------------------------------------------------------------------

/**
 * Retrieve an HTML diff showing changes between summary versions.
 */
export async function getSummaryDiff(summaryId: string, token: string) {
  const response = await apiClient.get(`/admin/summaries/${summaryId}/diff`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data as { summary_id: string; diff: string };
 main
}

// Retrieve the current user's referral code
export async function getReferralCode(token: string) {
  // Notes: Send GET request to the referral code endpoint
  const response = await apiClient.get('/referral/code', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: The backend returns an object with the code string
  return response.data as { referral_code: string };
}

// Redeem a referral code for the authenticated user
export async function submitReferralCode(code: string, token: string) {
  // Notes: POST the code to the referral redemption endpoint
  const response = await apiClient.post(
    '/referral/use',
    code,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the backend confirmation payload
  return response.data;
}

// ---------------------------------------------------------------------------
// Segment management endpoints used by the admin interface
// ---------------------------------------------------------------------------

// Retrieve all user segments defined in the backend
export async function getSegments(token: string) {
  const response = await apiClient.get('/admin/segments', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Create a new segment using the provided definition
export async function createSegment(data: Record<string, unknown>, token: string) {
  const response = await apiClient.post('/admin/segments', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Update an existing segment by id
export async function updateSegment(
  segmentId: string,
  data: Record<string, unknown>,
  token: string
) {
  const response = await apiClient.put(`/admin/segments/${segmentId}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Delete a segment by id
export async function deleteSegment(segmentId: string, token: string) {
  const response = await apiClient.delete(`/admin/segments/${segmentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Evaluate a segment and return matching users
export async function evaluateSegment(segmentId: string, token: string) {
  const response = await apiClient.get(`/admin/segments/${segmentId}/evaluate`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

/**
 * Retrieve recent agent failure logs for administrative dashboards.
 * Optional limit and offset parameters support pagination of results.
 */
export async function getAgentFailures(
  token: string,
  limit?: number,
  offset?: number
) {
  // Notes: Build query parameters only when provided
  const params: Record<string, number> = {};
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;

  // Notes: Perform GET request to the new admin failures endpoint
  const response = await apiClient.get('/admin/agents/failures', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  // Notes: Return the parsed JSON payload of failures
  return response.data;
}

// Notes: Manually trigger processing of the failure queue
export async function processFailureQueue(token: string) {
  // Notes: POST to the admin endpoint that processes queued failures
  const response = await apiClient.post(
    '/admin/agent-failures/process',
    null,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Response is a simple status payload
  return response.data;
}

// Notes: Retrieve recent agent timeouts for administrators
export async function getAgentTimeouts(token: string, limit = 100) {
  // Notes: Perform GET request to the admin agent-timeouts endpoint
  const response = await apiClient.get('/admin/agent-timeouts', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit }
  });
  // Notes: Return the list of timeout records
  return response.data;
}

// Retrieve aggregated agent token costs for dashboards
export async function getAgentCostTotals(token: string) {
  const response = await apiClient.get('/admin/agents/costs', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Trigger goal recommendations for a user segment
export async function triggerGoalRecommendations(
  token: string,
  segmentId: string
) {
  // Notes: POST to the admin endpoint initiating recommendation generation
  const response = await apiClient.post(
    '/admin/recommendations/trigger',
    { segment_id: segmentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Response contains a count of goals that were created
  return response.data;
}

// Retrieve all personalization profiles for the current user
export async function getPersonalizations(token: string) {
  // Notes: Issue GET request to the account personalization endpoint
  const response = await apiClient.get('/account/personalizations', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the list of personalization objects
  return response.data;
}

// Persist a personalization profile for a specific agent
export async function savePersonalization(
  token: string,
  agent_name: string,
  personality_profile: string
) {
  // Notes: POST data to the update endpoint with required fields
  const response = await apiClient.post(
    '/account/personalizations/update',
    { agent_name, personality_profile },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the updated or created record
  return response.data;
}

// Retrieve device sync logs for the admin dashboard
export async function getDeviceSyncLogs(
  token: string,
  params: { limit?: number; offset?: number }
) {
  // Notes: Send GET request with pagination parameters
  const response = await apiClient.get('/admin/device-sync-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  // Notes: Return array of sync log objects
  return response.data as Array<{
    id: string;
    user_id: number;
    source: string;
    sync_status: string;
    synced_at: string;
    raw_data_preview: unknown;
  }>;
}

// Retrieve wearable sync logs for admin audit pages
export async function getWearableSyncLogs(
  token: string,
  limit = 100,
  offset = 0
) {
  // Notes: Perform GET request with pagination
  const response = await apiClient.get('/admin/wearables/sync-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit, offset }
  });
  // Notes: Returns list of log objects with id, user_id, device_type, etc.
  // The endpoint supports standard limit/offset pagination
  return response.data as Array<{
    id: string;
    user_id: number;
    device_type: string;
    sync_status: string;
    synced_at: string;
    raw_data_url: string | null;
  }>;
}

// Retrieve reflection prompts generated for the given user
export async function getReflectionPrompts(userId: string, token: string) {
  // Notes: Issue GET request to the new reflection prompts endpoint
  const response = await apiClient.get(`/reflection-prompts/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the array of prompts from the backend
  return response.data;
}

// Retrieve conflict flags detected for the user
export async function getConflictFlags(userId: string, token: string) {
  const response = await apiClient.get(`/conflict-flags/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Mark a conflict flag as resolved
export async function resolveConflictFlag(flagId: string, token: string) {
  const response = await apiClient.patch(
    `/conflict-flags/${flagId}/resolve`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// Trigger habit synchronization for the current user
export async function postHabitSync(
  token: string,
  payload: { source: string }
) {
  const response = await apiClient.post('/habit-sync/sync', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve averaged habit metrics
export async function getHabitSummary(
  token: string,
  params: { days?: number }
) {
  const response = await apiClient.get('/habit-sync/summary', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
}

// Submit a single wearable metric
export async function pushWearableData(
  token: string,
  payload: {
    source: string;
    data_type: string;
    value: string | number;
    recorded_at: string;
  }
) {
  const response = await apiClient.post('/user/wearables', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve the latest wearable metric of a given type
export async function getWearableData(
  token: string,
  params: { data_type: string }
) {
  const response = await apiClient.get('/user/wearables', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
}

// Retrieve current agent toggle states for the admin panel
export async function getAgentToggles(token: string) {
  const response = await apiClient.get('/admin/agent-toggles', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Update the enabled status of a specific agent
export async function updateAgentToggle(
  token: string,
  payload: { agent_name: string; enabled: boolean }
) {
  const response = await apiClient.post('/admin/agent-toggles', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve agent access policy matrix
export async function getAgentAccess(token: string) {
  const response = await apiClient.get('/admin/agent-access', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Update a single access policy entry
export async function updateAgentAccess(
  token: string,
  payload: { agent_name: string; subscription_tier: string; is_enabled: boolean }
) {
  const response = await apiClient.post('/admin/agent-access/update', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve recent low rating alerts for admins
export async function getFeedbackAlerts(token: string) {
  const response = await apiClient.get('/admin/feedback-alerts', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve agent output flags pending review
export async function getAgentFlags(token: string) {
  const response = await apiClient.get('/admin/agent-flags', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Mark a flag entry as reviewed
export async function reviewAgentFlag(token: string, flagId: string) {
  const response = await apiClient.post(
    '/admin/agent-flags/review',
    { flag_id: flagId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// Retrieve all admin flag reasons
export async function getFlagReasons(token: string) {
  const response = await apiClient.get('/admin/flag-reasons', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Create a new flag reason record
export async function createFlagReason(
  token: string,
  payload: { label: string; category?: string }
) {
  const response = await apiClient.post('/admin/flag-reasons', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Delete an existing flag reason by id
export async function deleteFlagReason(token: string, id: string) {
  const response = await apiClient.delete(`/admin/flag-reasons/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve aggregated flag reason usage statistics
export async function getFlagReasonAnalytics(
  token: string,
  startDate?: string,
  endDate?: string
) {
  const response = await apiClient.get('/admin/flag-reason-analytics', {
    headers: { Authorization: `Bearer ${token}` },
    params: { start: startDate, end: endDate }
  });
  return response.data as Array<{ reason: string; count: number }>;
}

// Retrieve summaries that have been flagged for moderation
export async function getFlaggedSummaries(
  token: string,
  filters?: Record<string, unknown>
) {
  const response = await apiClient.get('/admin/summaries/flagged', {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });
  return response.data;
}

// Flag a summary via the admin API
export async function flagSummary(
  summaryId: string,
  reason: string,
  token: string
) {
  const response = await apiClient.post(
    `/admin/summaries/${summaryId}/flag`,
    { reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// Remove a moderation flag from a summary
export async function unflagSummary(summaryId: string, token: string) {
  const response = await apiClient.post(
    `/admin/summaries/${summaryId}/unflag`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// Assign a persona token to a user via the admin API
export async function postPersonaToken(
  token: string,
  payload: { user_id: number; token_name: string }
) {
  const response = await apiClient.post('/admin/persona-tokens', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve a user's persona token using the admin API
export async function getPersonaToken(token: string, user_id: number) {
  const response = await apiClient.get(`/admin/persona-tokens/${user_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve a user's persona snapshot via the admin API
// Notes: Returns list of traits and last updated timestamp
export async function getUserPersonaSnapshot(userId: string, token: string) {
  const response = await apiClient.get(`/admin/persona/${userId}/snapshot`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data as { traits: string[]; last_updated: string };
}

// Retrieve aggregated agent usage for a user
export async function getUserAgentUsageSummary(userId: string, token: string) {
  const response = await apiClient.get(
    `/admin/agents/usage-summary/${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data as Array<{
    agent_name: string;
    runs: number;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    last_run: string;
  }>;
}

// Retrieve all persona presets via the admin API
// Notes: Fetch all persona presets for the admin dashboard
export async function getPersonaPresets(token: string) {
  const response = await apiClient.get('/admin/persona-presets', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Create a new persona preset using the admin API
// Notes: Persist a new persona preset record
export async function createPersonaPreset(
  token: string,
  data: Record<string, unknown>
) {
  const response = await apiClient.post('/admin/persona-presets', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Update an existing persona preset
// Notes: Update fields on an existing preset
export async function updatePersonaPreset(
  token: string,
  id: string,
  data: Record<string, unknown>
) {
  const response = await apiClient.put(`/admin/persona-presets/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Delete a persona preset
// Notes: Remove a persona preset
export async function deletePersonaPreset(token: string, id: string) {
  const response = await apiClient.delete(`/admin/persona-presets/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve the list of enabled features for the logged-in user
// The UI queries this to decide which modules should be shown
export async function getEnabledFeatures(token: string) {
  const response = await apiClient.get('/api/settings/enabled-features', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Update the enabled features via the admin API
export async function updateFeatures(token: string, payload: { features: string[] }) {
  const response = await apiClient.post('/admin/features', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Retrieve prompt versions for a specific agent
export async function getPromptVersions(token: string, agentName: string) {
  const response = await apiClient.get('/admin/prompt-versions', {
    headers: { Authorization: `Bearer ${token}` },
    params: { agent_name: agentName }
  });
  return response.data;
}

// Create a new prompt version record
export async function postPromptVersion(
  token: string,
  payload: { agentName: string; version: string; template: string; metadata?: any }
) {
  const response = await apiClient.post('/admin/prompt-versions', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// Exporting the configured client lets other modules import a single instance
// instead of creating new Axios clients every time.
export default apiClient;
// Footnote: Consolidates all direct HTTP calls to the backend.

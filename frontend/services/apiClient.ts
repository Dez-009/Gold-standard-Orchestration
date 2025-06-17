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

// Send a prompt to the agent orchestration route
// Notes: Includes the user's JWT token for authentication
export async function orchestrateAiRequest(prompt: string, token: string) {
  // Notes: Issue the POST request to the new orchestration endpoint
  const response = await apiClient.post(
    '/ai/orchestrate',
    { prompt },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Notes: Return the backend payload containing agent and response
  return response.data;
}

// Send a prompt to the multi-agent orchestration endpoint
// Notes: Includes user_id so the backend can validate ownership
export async function postOrchestrationPrompt(
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
  // Notes: Return the aggregated agent responses
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
  // Notes: Return the summary payload
  return response.data as { summary: string };
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
  limit?: number,
  offset?: number
) {
  // Notes: Build query params only when values are provided
  const params: Record<string, number> = {};
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;

  // Notes: Issue the HTTP request to fetch log records
  const response = await apiClient.get('/admin/audit-logs', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  // Notes: Return the array of log objects from the backend
  return response.data;
}

// Notes: Retrieve orchestration history for administrator view
// Notes: Sends GET request to the /admin/orchestration-log endpoint
export async function getOrchestrationLogs(
  token: string,
  limit?: number,
  offset?: number
) {
  // Notes: Build query params conditionally
  const params: Record<string, number> = {};
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;

  // Notes: Issue the HTTP request to fetch orchestration records
  const response = await apiClient.get('/admin/orchestration-log', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  // Notes: Return the resulting log array
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

// Retrieve AI model performance logs for administrators
// Notes: Sends GET request to the /admin/model-logs endpoint
export async function getModelLogs(token: string) {
  const response = await apiClient.get('/admin/model-logs', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Notes: Return the list of model log records
  return response.data;
}

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

// Exporting the configured client lets other modules import a single instance
// instead of creating new Axios clients every time.
export default apiClient;

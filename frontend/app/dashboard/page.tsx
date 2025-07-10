// Dashboard page showing a welcome message and user email
// Redirects to login if no token is found in localStorage

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getToken,
  parseUserFromToken,
  isTokenExpired
} from '../../services/authUtils';
import { fetchAccountDetails } from '../../services/accountService';
import { createBillingPortalSession } from '../../services/billingService';

// Notes: Import helper to retrieve the user's subscription status
import {
  fetchSubscriptionStatus,
  SubscriptionStatus
} from '../../services/subscriptionService';
import { showError } from '../../components/ToastProvider';
import { trackEvent } from '../../services/analyticsService';
import { getHabitTrends } from '../../services/habitSyncService';

export default function DashboardPage() {
  // Notes: Store email and role info parsed from the JWT
  const [user, setUser] = useState<{ email: string | null; role: string | null }>({ email: null, role: null });
  const router = useRouter();
  // Notes: Track the user's current subscription tier
  const [tier, setTier] = useState<string | null>(null);
  // Notes: Track whether we are waiting for the billing portal URL
  const [portalLoading, setPortalLoading] = useState(false);

  // Notes: Store subscription details retrieved from the backend
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  // Notes: Manage loading and error states for subscription fetch
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState('');
  const [habitSummary, setHabitSummary] = useState<{ steps: number; sleep_hours: number; active_minutes: number } | null>(null);

  // Notes: On mount, verify token validity and parse user info
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Clear stale token and force user to re-authenticate
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    // Notes: Store parsed email and role in state
    const userInfo = parseUserFromToken(token);
    setUser(userInfo);
    // Notes: Log a page view analytics event
    trackEvent('page_view', { page: 'dashboard', role: userInfo.role });
    // Notes: Retrieve account info to determine subscription tier
    const loadTier = async () => {
      try {
        const data = await fetchAccountDetails();
        setTier((data as { tier?: string }).tier ?? null);
      } catch {
        // Ignore failures and keep tier null
      }
    };
    const loadStatus = async () => {
      setStatusLoading(true);
      setStatusError('');
      try {
        // Notes: Fetch subscription status for display
        const data = await fetchSubscriptionStatus();
        setSubscription(data);
      } catch {
        // Notes: Track error state when the request fails
        setStatusError('Unable to load subscription');
      } finally {
        setStatusLoading(false);
      }
    };
    const loadHabits = async () => {
      try {
        const summary = await getHabitTrends();
        setHabitSummary(summary);
      } catch {
        // Ignore errors silently
      }
    };
    loadTier();
    loadStatus();
    loadHabits();
  }, [router]);

  // Launch Stripe billing portal and redirect on success
  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      // Notes: Request the portal session URL from the backend
      const { url } = await createBillingPortalSession();
      if (url) {
        window.location.href = url;
      }
    } catch {
      // Notes: Show a toast when the portal request fails
      showError('Failed to load billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  // Notes: Helper to render a colored badge for the subscription status
  const badge = (s: string) => {
    const color =
      s === 'Active'
        ? 'bg-green-600'
        : s === 'Trialing'
        ? 'bg-yellow-500'
        : s === 'Past Due'
        ? 'bg-red-600'
        : 'bg-gray-500';
    return <span className={`px-2 py-1 rounded text-white ${color}`}>{s}</span>;
  };

  // Render dashboard with simple styling and user information
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      {/* Header with user info and logout */}
      <div className="w-full max-w-6xl flex justify-between items-center p-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back to Vida Coach!</h1>
          {user.email && <p className="text-lg text-gray-600">Logged in as {user.email}</p>}
          <p className="text-sm text-gray-500">Role: {user.role || 'user'}</p>
        </div>
        <div className="flex items-center space-x-4">
          {user.role === 'admin' && (
            <Link 
              href="/admin-dashboard" 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      {/* Simple navigation links to feature pages */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <Link href="/coach" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">🤖 AI Coach</h3>
            <p className="text-sm text-gray-600">Chat with your AI coach</p>
          </Link>
          <Link href="/orchestration" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">🎭 Orchestration Demo</h3>
            <p className="text-sm text-gray-600">Multi-agent coaching demo</p>
          </Link>
          <Link href="/user/goals" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">🎯 Goals</h3>
            <p className="text-sm text-gray-600">Manage your goals</p>
          </Link>
          <Link href="/user/goals/progress" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">📈 Goal Progress</h3>
            <p className="text-sm text-gray-600">Track goal progress</p>
          </Link>
          <Link href="/journal/history" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">📖 Journal History</h3>
            <p className="text-sm text-gray-600">View your journal entries</p>
          </Link>
          <Link href="/checkin" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">✅ Daily Check-In</h3>
            <p className="text-sm text-gray-600">Complete daily check-in</p>
          </Link>
          <Link href="/mood" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">😊 Mood Tracker</h3>
            <p className="text-sm text-gray-600">Track your mood</p>
          </Link>
          <Link href="/mood/trends" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">📊 Mood Trends</h3>
            <p className="text-sm text-gray-600">View mood analytics</p>
          </Link>
          <Link href="/review" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">📝 Weekly Review</h3>
            <p className="text-sm text-gray-600">Review your week</p>
          </Link>
          <Link href="/suggestions" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">💡 Suggestions</h3>
            <p className="text-sm text-gray-600">AI-powered suggestions</p>
          </Link>
          <Link href="/sessions" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">💬 Sessions</h3>
            <p className="text-sm text-gray-600">Coaching session history</p>
          </Link>
          <Link href="/profile" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">⚙️ Profile Settings</h3>
            <p className="text-sm text-gray-600">Manage your profile</p>
          </Link>
          <Link href="/account" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">👤 Account</h3>
            <p className="text-sm text-gray-600">Account & billing</p>
          </Link>
          {!subscription || subscription.status !== 'Active' ? (
            <Link href="/subscribe" className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="font-medium text-blue-700 mb-2">💳 Subscribe</h3>
              <p className="text-sm text-blue-600">Upgrade your plan</p>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Notes: Show admin links only when the user has admin role */}
      {user.role === 'admin' && (
        <nav className="self-end mr-4 mt-2 space-x-4 border-t pt-2">
          <span className="font-semibold mr-2">Admin:</span>
          <Link href="/admin/audit" className="text-blue-600 underline">
            Audit Logs
          </Link>
          <Link href="/admin/health" className="text-blue-600 underline">
            System Health
          </Link>
          {/* Notes: Link to the system metrics dashboard */}
          <Link href="/admin/metrics" className="text-blue-600 underline">
            Metrics
          </Link>


          <Link href="/admin/config" className="text-blue-600 underline">
            Configuration
          </Link>
          <Link href="/admin/system-logs" className="text-blue-600 underline">
            System Logs
          </Link>
          {/* Link to system maintenance tasks */}
          <Link href="/admin/system" className="text-blue-600 underline">
            System Tasks
          </Link>
          {/* Notes: Link to view all subscriptions */}
          <Link href="/admin/subscriptions" className="text-blue-600 underline">
            Subscriptions
          </Link>
          {/* Link to audit subscription history */}
          <Link
            href="/admin/subscriptions/history"
            className="text-blue-600 underline"
          >
            Subscription History
          </Link>
          {/* Link to billing settings management */}
          <Link href="/admin/billing" className="text-blue-600 underline">
            Billing Settings
          </Link>
          {/* Link to the new user management page */}
          <Link href="/admin/users" className="text-blue-600 underline">
            Users
          </Link>
          {/* Link to the admin error monitoring page */}
          <Link href="/admin/errors" className="text-blue-600 underline">
            Errors
          </Link>
        </nav>
      )}

      {/* Welcome header */}
      <div className="text-center space-y-2">
        {/* Notes: Show the current subscription tier using a colored badge */}
        <p className="text-lg">
          Subscription: {badge(tier || 'No Subscription')}
        </p>
      </div>

      {/* Card showing current subscription status */}
      <div className="border rounded p-4 w-full max-w-xs text-center space-y-2">
        <p>
          <span className="font-semibold">Subscription:</span>{' '}
          {tier || 'Free'}
        </p>
        {/* Show manage button only when a paid tier is active */}
        {tier && tier !== 'Free' && (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {portalLoading ? 'Loading...' : 'Manage Subscription'}
          </button>
        )}
      </div>

      {/* Subscription status card */}
      <div className="border rounded p-4 shadow-md text-center w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-2">Subscription</h2>
        {/* Spinner while loading */}
        {statusLoading && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
        )}
        {/* Error message when API call fails */}
        {statusError && <p className="text-red-600">{statusError}</p>}
        {/* Show message if no subscription found */}
        {!statusLoading && !statusError && !subscription && <p>No subscription found.</p>}
        {/* Subscription details when available */}
        {!statusLoading && !statusError && subscription && (
          <div className="space-y-1">
            <div>
              <span className="font-semibold mr-2">Tier:</span>
              <span>{subscription.tier}</span>
            </div>
            <div>
              <span className="font-semibold mr-2">Status:</span>
              {badge(subscription.status)}
            </div>
            <div>
              <span className="font-semibold mr-2">Next Billing:</span>
              <span>
                {subscription.next_billing_date
                  ? new Date(subscription.next_billing_date).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-semibold mr-2">Provider:</span>
              <span>{subscription.provider}</span>
            </div>
          </div>
        )}
      </div>

      {/* Habit summary card */}
      {habitSummary && (
        <div className="border rounded p-4 shadow-md text-center w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-2">Habit Summary</h2>
          <p>Avg Steps: {habitSummary.steps}</p>
          <p>Avg Sleep: {habitSummary.sleep_hours} hrs</p>
          <p>Active Minutes: {habitSummary.active_minutes}</p>
        </div>
      )}

      {/* Static user profile placeholder information */}
      <div className="border rounded p-4 text-center">
        <p className="font-semibold">John Doe</p>
        <p>Age: 30</p>
        <p>Goals: Stay active and eat healthy</p>
      </div>

      {/* Button linking to the AI coach page */}
      <Link
        href="/coach"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Get AI Coaching
      </Link>

    </div>
  );
}

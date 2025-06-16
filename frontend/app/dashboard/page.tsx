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
import { showError } from '../../components/ToastProvider';

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
    setUser(parseUserFromToken(token));
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
    loadTier();
    loadStatus();
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
      {/* Simple navigation links to feature pages */}
      <nav className="self-end mr-4 space-x-4">
        <Link href="/coach" className="text-blue-600 underline">
          AI Coach
        </Link>
        <Link href="/goals" className="text-blue-600 underline">
          Goals
        </Link>
        {/* Link to the goal progress tracker */}
        <Link href="/goals/progress" className="text-blue-600 underline">
          Goal Progress
        </Link>
        {/* Link to the journal history page */}
        <Link href="/journal/history" className="text-blue-600 underline">
          Journal History
        </Link>
        {/* Link to the daily check-in page */}
        <Link href="/checkin" className="text-blue-600 underline">
          Daily Check-In
        </Link>
        {/* Link to the mood tracking page */}
        <Link href="/mood" className="text-blue-600 underline">
          Mood Tracker
        </Link>
        {/* Link to the mood trends analytics page */}
        <Link href="/mood/trends" className="text-blue-600 underline">
          Mood Trends
        </Link>
        <Link href="/review" className="text-blue-600 underline">
          Weekly Review
        </Link>
        {/* Link to the weekly summary page */}
        <Link href="/review/weekly" className="text-blue-600 underline">
          Review Summary
        </Link>
        {/* Link to the new weekly review overview page */}
        <Link href="/weekly-review" className="text-blue-600 underline">
          Weekly Overview
        </Link>
        {/* Link to the AI goal suggestions page */}
        <Link href="/suggestions" className="text-blue-600 underline">
          Suggestions
        </Link>
        {/* Link to the new goal suggestions page */}
        <Link href="/goals/suggestions" className="text-blue-600 underline">
          Goal Suggestions
        </Link>
        {/* Link to the coaching session history page */}
        <Link href="/sessions" className="text-blue-600 underline">
          Sessions
        </Link>
        {/* Link to the profile settings page */}
        <Link href="/profile" className="text-blue-600 underline">
          Profile Settings
        </Link>
        {/* Link to the subscription and billing management page */}
        <Link href="/account" className="text-blue-600 underline">
          Account
        </Link>
        {/* Link to subscribe page when no active plan */}
        {!subscription || subscription.status !== 'Active' ? (
          <Link href="/subscribe" className="text-blue-600 underline">
            Subscribe
          </Link>
        ) : null}
        {/* Temporary link to the public landing page */}
        <Link href="/landing" className="text-blue-600 underline">
          Landing
        </Link>
      </nav>

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
          {/* Notes: Link to view all subscriptions */}
          <Link href="/admin/subscriptions" className="text-blue-600 underline">
            Subscriptions
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
      <h1 className="text-3xl font-bold">Welcome back to Vida Coach!</h1>
      {/* Notes: Display the logged in user's email */}
      {user.email && <p className="text-lg">Logged in as {user.email}</p>}

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

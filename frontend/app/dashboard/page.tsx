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
import { showError } from '../../components/ToastProvider';

export default function DashboardPage() {
  // Notes: Store email and role info parsed from the JWT
  const [user, setUser] = useState<{ email: string | null; role: string | null }>({ email: null, role: null });
  const router = useRouter();

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
  }, [router]);

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
          {/* Notes: Link to view all subscriptions */}
          <Link href="/admin/subscriptions" className="text-blue-600 underline">
            Subscriptions
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

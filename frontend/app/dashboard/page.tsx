// Dashboard page showing a welcome message and user email
// Redirects to login if no token is found in localStorage

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken, parseUserFromToken } from '../../services/authUtils';

export default function DashboardPage() {
  // Local state to hold the email extracted from the token
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  // On mount, verify token and extract user email
  useEffect(() => {
    const token = getToken();
    if (!token) {
      // Redirect unauthenticated users to login
      router.push('/login');
      return;
    }
    // Parse email from the JWT payload
    setEmail(parseUserFromToken(token));
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
        {/* Link to the daily check-in page */}
        <Link href="/checkin" className="text-blue-600 underline">
          Daily Check-In
        </Link>
        <Link href="/review" className="text-blue-600 underline">
          Weekly Review
        </Link>
        {/* Link to the coaching session history page */}
        <Link href="/sessions" className="text-blue-600 underline">
          Sessions
        </Link>
        {/* Link to the profile management page */}
        <Link href="/profile" className="text-blue-600 underline">
          Profile
        </Link>
      </nav>

      {/* Welcome header */}
      <h1 className="text-3xl font-bold">Welcome back to Vida Coach!</h1>
      {/* Show logged-in email if available */}
      {email && <p className="text-lg">Logged in as {email}</p>}

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

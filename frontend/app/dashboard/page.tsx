// Dashboard page showing a welcome message and user email
// Redirects to login if no token is found in localStorage

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  // Render dashboard with simple styling
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome back to Vida Coach!</h1>
      {email && <p className="text-lg">Logged in as {email}</p>}
    </div>
  );
}

'use client';
// Page showing the user's referral code and a shareable link

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchReferralCode } from '../../../services/referralService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function ReferralPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    fetchReferralCode()
      .then((c) => setCode(c))
      .catch(() => setError('Failed to load code'));
  }, [router]);

  const shareLink = `${window.location.origin}/register?code=${code}`;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Invite Friends</h1>
      {error && <p className="text-red-600">{error}</p>}
      {!error && (
        <div className="space-y-2">
          <p>Your referral code:</p>
          <code className="px-2 py-1 bg-gray-100 rounded">{code}</code>
          <p>Share this link:</p>
          <code className="px-2 py-1 bg-gray-100 rounded break-all">{shareLink}</code>
        </div>
      )}
    </div>
  );
}

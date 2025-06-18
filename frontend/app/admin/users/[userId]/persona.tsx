'use client';
/**
 * Admin page showing a snapshot of a user's persona traits.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getUserPersonaSnapshot } from '../../../../services/apiClient';
import { getToken, isTokenExpired, isAdmin } from '../../../../services/authUtils';
import { showError } from '../../../../components/ToastProvider';

export default function UserPersonaSnapshotPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const [traits, setTraits] = useState<string[]>([]);
  const [updated, setUpdated] = useState<string>('');

  // Validate admin session and fetch the snapshot
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      try {
        const data = await getUserPersonaSnapshot(userId, token);
        setTraits(data.traits);
        setUpdated(data.last_updated);
      } catch {
        showError('Failed to load persona snapshot');
      }
    };
    load();
  }, [router, userId]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Persona Snapshot</h1>
      {/* Display traits as tags */}
      <div className="flex flex-wrap gap-2">
        {traits.map((t) => (
          <span key={t} className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
            {t}
          </span>
        ))}
      </div>
      {/* Last updated timestamp */}
      <p className="text-sm text-gray-600">Last updated: {updated}</p>
      {/* Refresh functionality will be added in a future task */}
    </div>
  );
}

'use client';
/**
 * Admin page for assigning persona tokens to a specific user.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { addPersonaToken, getUserPersonaToken } from '../../../../services/personaTokenService';
import { getToken, isTokenExpired, isAdmin } from '../../../../services/authUtils';
import { showError, showSuccess } from '../../../../components/ToastProvider';

const tokens = [
  { name: 'deep_reflector', desc: 'prefers thoughtful, in-depth analysis.' },
  { name: 'quick_rebounder', desc: 'prefers short feedback and future focus.' },
];

export default function UserPersonaTokenPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const [current, setCurrent] = useState<string | null>(null);
  const [selected, setSelected] = useState('');

  // Validate admin session and load existing token
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
        const data = await getUserPersonaToken(userId);
        setCurrent(data.token_name);
        setSelected(data.token_name);
      } catch {
        // When no token exists simply ignore
      }
    };
    load();
  }, [router, userId]);

  // Persist the selected token for the user
  const handleSave = async () => {
    try {
      await addPersonaToken(userId, selected);
      showSuccess('Persona token saved');
      setCurrent(selected);
    } catch {
      // Error toast handled in service
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Persona Token</h1>
      {/* Display current token if set */}
      <p className="text-sm text-gray-700">Current token: {current ?? 'none'}</p>
      {/* Dropdown for selecting token */}
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">--</option>
        {tokens.map((t) => (
          <option key={t.name} value={t.name} className="capitalize">
            {t.name}
          </option>
        ))}
      </select>
      {/* Informational cards describing token behaviors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
        {tokens.map((t) => (
          <div key={t.name} className="border p-2 rounded">
            <p className="font-semibold capitalize">{t.name.replace('_', ' ')}</p>
            <p className="text-sm">{t.desc}</p>
          </div>
        ))}
      </div>
      {/* Save button */}
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  );
}

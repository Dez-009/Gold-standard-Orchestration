'use client';
/**
 * Admin page for managing feature flags.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { getFeatureFlags, updateFeatureFlag } from '../../../services/apiClient';
import { showError, showSuccess } from '../../../components/ToastProvider';

interface FeatureFlagRow {
  feature_key: string;
  access_tier: string;
  enabled: boolean;
  updated_at: string;
}

export default function FeatureFlagsPage() {
  const router = useRouter();
  const [flags, setFlags] = useState<FeatureFlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getFeatureFlags(token);
        setFlags(data);
      } catch {
        setError('Failed to load feature flags');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const tiers = ['free', 'plus', 'pro', 'admin'];

  const handleUpdate = async (
    feature_key: string,
    access_tier: string,
    enabled: boolean
  ) => {
    const token = getToken();
    if (!token) return;
    try {
      const updated = await updateFeatureFlag(token, {
        feature_key,
        access_tier,
        enabled
      });
      setFlags((prev) =>
        prev.map((f) =>
          f.feature_key === feature_key ? { ...f, ...updated } : f
        )
      );
      showSuccess('Feature updated');
    } catch {
      showError('Failed to update feature');
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Feature Flags</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && flags.length === 0 && <p>No feature flags.</p>}
      {!loading && !error && flags.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">Feature</th>
                <th className="px-4 py-2">Enabled</th>
                <th className="px-4 py-2">Access Tier</th>
                <th className="px-4 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((f) => (
                <tr key={f.feature_key} className="odd:bg-gray-100 text-center">
                  <td className="border px-4 py-2 lowercase">{f.feature_key}</td>
                  <td className="border px-4 py-2">
                    <input
                      type="checkbox"
                      checked={f.enabled}
                      onChange={(e) =>
                        handleUpdate(f.feature_key, f.access_tier, e.target.checked)
                      }
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <select
                      value={f.access_tier}
                      onChange={(e) =>
                        handleUpdate(f.feature_key, e.target.value, f.enabled)
                      }
                      className="border p-1 rounded"
                    >
                      {tiers.map((t) => (
                        <option key={t} value={t} className="capitalize">
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-4 py-2">{fmt(f.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Footnote: Allows admins to toggle features and required tiers.

'use client';
/**
 * Admin page listing all application features with checkboxes to enable them.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAdmin, getToken, isTokenExpired } from '../../../services/authUtils';
import { getEnabledFeatures, updateFeatures } from '../../../services/apiClient';
import { showError, showSuccess } from '../../../components/ToastProvider';

const ALL_FEATURES = ['journal', 'goals', 'checkins', 'pdf_export', 'agent_feedback'];

export default function FeatureSettingsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load current feature list on mount
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
      try {
        const data = await getEnabledFeatures(token);
        setSelected(data.enabled_features);
      } catch {
        showError('Failed to load features');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await updateFeatures(token, { features: selected });
      showSuccess('Features updated');
    } catch {
      showError('Failed to save');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Features</h1>
      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      ) : (
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2">Feature</th>
              <th className="px-4 py-2">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {ALL_FEATURES.map((f) => (
              <tr key={f} className="odd:bg-gray-100 text-center">
                <td className="border px-4 py-2">{f}</td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(f)}
                    onChange={() => toggle(f)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
        className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
        onClick={handleSave}
        disabled={loading}
      >
        Save
      </button>
    </div>
  );
}

// Footnote: Admin UI for enabling and disabling feature flags.

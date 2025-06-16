'use client';
// Admin configuration management page allowing feature flag toggles
// Fetches current settings from the backend and persists updates

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAppConfig, updateAppConfig } from '../../../services/appConfigService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

// Shape of the configuration object returned by the backend
interface AppConfig {
  feature_flags: Record<string, boolean>;
  openai_key_loaded: boolean;
  environment: string;
  version: string;
}

export default function ConfigPage() {
  const router = useRouter(); // Router used for redirects

  // Local state holding configuration and status flags
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Verify session and load configuration on mount
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
        const data = await fetchAppConfig();
        setConfig(data);
      } catch {
        setError('Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Handle toggling of a specific feature flag
  const toggleFlag = async (key: string) => {
    if (!config) return;
    const updated = { ...config.feature_flags, [key]: !config.feature_flags[key] };
    setConfig({ ...config, feature_flags: updated });
    setSaving(true);
    try {
      await updateAppConfig({ feature_flags: updated });
      showSuccess('Saved successfully');
    } catch {
      showError('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">App Configuration</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {config && !loading && (
        <div className="w-full max-w-md space-y-4">
          {/* Feature flag editing form */}
          <div className="border rounded p-4 space-y-2">
            <h2 className="font-semibold mb-2">Feature Flags</h2>
            {Object.entries(config.feature_flags).map(([key, value]) => (
              <label key={key} className="flex justify-between items-center">
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleFlag(key)}
                  className="ml-2"
                />
              </label>
            ))}
            {saving && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
            )}
          </div>
          {/* Read-only summary values */}
          <div className="border rounded p-4 space-y-2">
            <div>
              <span className="font-semibold mr-2">OpenAI Key Loaded:</span>
              <span>{config.openai_key_loaded ? 'True' : 'False'}</span>
            </div>
            <div>
              <span className="font-semibold mr-2">Environment:</span>
              <span className="capitalize">{config.environment}</span>
            </div>
            <div>
              <span className="font-semibold mr-2">Version:</span>
              <span>{config.version}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
// Admin billing settings management page
// Displays current billing configuration and allows updates

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchBillingConfig,
  updateBillingConfig
} from '../../../services/billingConfigService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

// Shape of the billing configuration used in this component
interface BillingConfig {
  stripe_public_key: string;
  webhook_active: boolean;
  plans: Array<{ name: string; price: number }>;
  currency: string;
  tax_rate?: number | null;
}

export default function BillingSettingsPage() {
  const router = useRouter(); // Router used for redirects

  // Local state for configuration and UI status flags
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Verify token and admin role then fetch configuration on mount
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
        const data = await fetchBillingConfig();
        setConfig(data);
      } catch {
        setError('Failed to load billing configuration');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Handle updating a specific plan price value
  const updatePlanPrice = (index: number, price: number) => {
    if (!config) return;
    const plans = config.plans.map((p, i) =>
      i === index ? { ...p, price } : p
    );
    setConfig({ ...config, plans });
  };

  // Persist changes to the backend
  const saveChanges = async () => {
    if (!config) return;
    setSaving(true);
    setError('');
    try {
      await updateBillingConfig(config as unknown as Record<string, unknown>);
      showSuccess('Saved successfully');
    } catch {
      setError('Failed to update billing configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Billing Settings</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {config && !loading && (
        <div className="w-full max-w-md space-y-4">
          {/* Read-only display of Stripe key and webhook status */}
          <div className="border rounded p-4 space-y-2">
            <div>
              <span className="font-semibold mr-2">Stripe Key:</span>
              <span className="break-all">{config.stripe_public_key}</span>
            </div>
            <div>
              <span className="font-semibold mr-2">Webhook:</span>
              <span>{config.webhook_active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          {/* Editable pricing and currency settings */}
          <div className="border rounded p-4 space-y-2">
            <h2 className="font-semibold mb-2">Plans</h2>
            {config.plans.map((plan, idx) => (
              <label key={plan.name} className="flex justify-between items-center">
                <span className="capitalize">{plan.name}</span>
                <input
                  type="number"
                  value={plan.price}
                  onChange={(e) => updatePlanPrice(idx, Number(e.target.value))}
                  className="border p-1 rounded w-24 ml-2"
                />
              </label>
            ))}
            <div className="pt-2">
              <label className="flex justify-between items-center">
                <span className="mr-2">Currency</span>
                <input
                  type="text"
                  value={config.currency}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                  className="border p-1 rounded w-24"
                />
              </label>
            </div>
            <div>
              <label className="flex justify-between items-center">
                <span className="mr-2">Tax Rate</span>
                <input
                  type="number"
                  value={config.tax_rate ?? 0}
                  onChange={(e) =>
                    setConfig({ ...config, tax_rate: Number(e.target.value) })
                  }
                  className="border p-1 rounded w-24"
                />
              </label>
            </div>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-2"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

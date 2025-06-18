'use client';
// Lightweight admin UI to quickly toggle features and update tier
import { useEffect, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@shadcn/ui';
import { FEATURE_KEYS, FeatureKey } from '../../../utils/feature_keys';
import {
  getFeatureFlags,
  updateFeatureFlag
} from '../../../services/apiClient';
import {
  getToken,
  isTokenExpired,
  isAdmin
} from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

interface FeatureRow {
  feature_key: FeatureKey;
  access_tier: string;
  enabled: boolean;
}

export default function QuickToggle() {
  const [rows, setRows] = useState<FeatureRow[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) return;
    getFeatureFlags(token)
      .then((data) => {
        if (data.length === 0) {
          setRows(
            FEATURE_KEYS.map((k) => ({
              feature_key: k,
              access_tier: 'free',
              enabled: true
            }))
          );
        } else {
          setRows(data);
        }
      })
      .catch(() => showError('Failed to load flags'));
  }, []);

  const handleChange = async (
    key: FeatureKey,
    tier: string,
    enabled: boolean
  ) => {
    const token = getToken();
    if (!token) return;
    try {
      const updated = await updateFeatureFlag(token, {
        feature_key: key,
        access_tier: tier,
        enabled
      });
      setRows((prev) =>
        prev.map((r) => (r.feature_key === key ? { ...r, ...updated } : r))
      );
      showSuccess('Feature updated');
    } catch {
      showError('Failed to update');
    }
  };

  const tiers = ['free', 'plus', 'pro', 'admin'];
  const filtered = rows.filter((r) =>
    r.feature_key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-2">
      <Popover>
        <PopoverTrigger className="px-3 py-1 border rounded bg-white">
          Quick Toggle
        </PopoverTrigger>
        <PopoverContent className="p-2 w-72 bg-white border space-y-2">
          <input
            className="w-full border p-1 rounded"
            placeholder="Search feature"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {filtered.map((r) => (
            <div key={r.feature_key} className="flex items-center gap-2">
              <span className="flex-1 lowercase">{r.feature_key}</span>
              <input
                type="checkbox"
                checked={r.enabled}
                onChange={(e) => handleChange(r.feature_key, r.access_tier, e.target.checked)}
              />
              <select
                value={r.access_tier}
                onChange={(e) => handleChange(r.feature_key, e.target.value, r.enabled)}
                className="border rounded p-1 text-sm"
              >
                {tiers.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}


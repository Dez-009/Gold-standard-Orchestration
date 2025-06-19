'use client';
// Page displaying the user's wearable connections and latest sync data.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { pushWearableData, getWearableData } from '../../services/apiClient';
import { showError } from '../../components/ToastProvider';

interface WearableMetric {
  data_type: string;
  value: string;
  recorded_at: string;
  source: string;
}

export default function WearableSyncPage() {
  const [sleep, setSleep] = useState<WearableMetric | null>(null);
  const [loading, setLoading] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      window.location.href = '/login';
    } else {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      const data = await getWearableData(token as string, {
        data_type: 'sleep'
      });
      if (!data.detail) setSleep(data);
    } catch {
      // ignore
    }
  };

  const handleManualSync = async () => {
    setLoading(true);
    try {
      await pushWearableData(token as string, {
        source: 'manual',
        data_type: 'sleep',
        value: '7',
        recorded_at: new Date().toISOString()
      });
      await loadData();
    } catch {
      showError('Failed to sync data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Link href="/dashboard" className="text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-xl font-bold">Wearable Sync</h1>
      <button
        onClick={handleManualSync}
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition"
        disabled={loading}
      >
        Manual Sync
      </button>
      {sleep ? (
        <div className="p-4 bg-green-100 rounded shadow animate-fade-in">
          <p className="font-medium">Latest Sleep:</p>
          <p>
            {sleep.value} hrs from {sleep.source} at{' '}
            {new Date(sleep.recorded_at).toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="italic">No sleep data synced yet.</p>
      )}
    </div>
  );
}

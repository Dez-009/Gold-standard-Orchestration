'use client';
// Admin page listing recent AI model usage logs

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchModelLogs, ModelLogRecord } from '../../../services/adminService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function ModelLogsPage() {
  const router = useRouter();
  // Notes: Local state for logs and UI flags
  const [logs, setLogs] = useState<ModelLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState<keyof ModelLogRecord>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);

  // Notes: Validate admin credentials and load data on mount
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
        const data = await fetchModelLogs();
        setLogs(data);
      } catch {
        setError('Failed to load model logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Sort logs client side
  const sorted = [...logs].sort((a, b) => {
    const res = a[sortField] < b[sortField] ? -1 : a[sortField] > b[sortField] ? 1 : 0;
    return sortAsc ? res : -res;
  });

  const toggleSort = (field: keyof ModelLogRecord) => {
    if (field === sortField) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const fmt = (t: string) => new Date(t).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back navigation */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Model Logs</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && sorted.length === 0 && <p>No logs found.</p>}
      {!loading && !error && sorted.length > 0 && (
        <div className="overflow-x-auto w-full max-h-[70vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('timestamp')}>Timestamp</th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('user_id')}>User</th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('provider')}>Provider</th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('model_name')}>Model</th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('tokens_used')}>Tokens</th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('latency_ms')}>Latency</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((log, idx) => (
                <tr key={idx} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{fmt(log.timestamp)}</td>
                  <td className="border px-4 py-2">{log.user_id}</td>
                  <td className="border px-4 py-2">{log.provider}</td>
                  <td className="border px-4 py-2">{log.model_name}</td>
                  <td className="border px-4 py-2">{log.tokens_used}</td>
                  <td className="border px-4 py-2">{log.latency_ms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

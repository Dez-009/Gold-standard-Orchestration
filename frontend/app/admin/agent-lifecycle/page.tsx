'use client';
// Admin page displaying agent lifecycle logs with filtering and pagination

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAgentLifecycleLogs, AgentLifecycleRecord } from '../../../services/agentLifecycleService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AgentLifecyclePage() {
  const router = useRouter();
  // Notes: State for lifecycle records and UI controls
  const [logs, setLogs] = useState<AgentLifecycleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agentName, setAgentName] = useState('');
  const [eventType, setEventType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Notes: Load logs whenever filters or pagination change
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
        const data = await fetchAgentLifecycleLogs({
          agent_name: agentName || undefined,
          event_type: eventType || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          limit,
          offset
        });
        setLogs(data);
      } catch {
        setError('Failed to load lifecycle logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, agentName, eventType, startDate, endDate, offset]);

  // Notes: Format timestamp for table output
  const fmt = (iso: string) => new Date(iso).toLocaleString();

  // Notes: Render the table rows of lifecycle logs
  const renderRows = () =>
    logs.map((log) => (
      <tr key={log.id} className="odd:bg-gray-100">
        <td className="border px-4 py-2">{fmt(log.timestamp)}</td>
        <td className="border px-4 py-2">{log.user_id}</td>
        <td className="border px-4 py-2">{log.agent_name}</td>
        <td className="border px-4 py-2">{log.event_type}</td>
        <td className="border px-4 py-2 truncate max-w-xs">
          {log.details?.slice(0, 50) ?? ''}
        </td>
      </tr>
    ));

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Agent Lifecycle Logs</h1>
      {/* Filter inputs */}
      <div className="flex flex-wrap gap-2">
        <input
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Agent"
          className="border p-1 rounded"
        />
        <input
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          placeholder="Event Type"
          className="border p-1 rounded"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-1 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-1 rounded"
        />
        <button onClick={() => setOffset(0)} className="px-3 py-1 border rounded">
          Apply
        </button>
      </div>
      {/* Loading and error states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No logs found.</p>}
      {/* Data table */}
      {!loading && !error && logs.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Event</th>
                <th className="px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
      )}
      {/* Pagination controls */}
      {!loading && !error && (
        <div className="flex space-x-4">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setOffset(offset + limit)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

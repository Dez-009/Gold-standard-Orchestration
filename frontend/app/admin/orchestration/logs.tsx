'use client';
// Admin page displaying orchestration performance metrics

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getFilteredOrchestrationLogs,
  exportOrchestrationLogsCSV
} from '../../../services/apiClient';
import { getOverrideHistory } from '../../../services/apiClient';
import { replayOrchestration } from '../../../services/apiClient';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface PerfLog {
  id: string;
  agent_name: string;
  user_id: number;
  execution_time_ms: number;
  input_tokens: number;
  output_tokens: number;
  status: string;
  fallback_triggered: boolean;
  timeout_occurred: boolean;
  retries: number;
  timestamp: string;
  override_triggered?: boolean;
  override_reason?: string | null;
}

export default function OrchestrationPerformancePage() {
  const router = useRouter();
  // Notes: Store retrieved logs in component state
  const [logs, setLogs] = useState<PerfLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState<keyof PerfLog>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [agentFilter, setAgentFilter] = useState('');
  const [overrideFilter, setOverrideFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fallbackFilter, setFallbackFilter] = useState('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  // Notes: Pagination parameters
  const [skip, setSkip] = useState(0);
  const [historyModal, setHistoryModal] = useState<PerfLog[] | null>(null);
  const [replayModal, setReplayModal] = useState<any | null>(null);
  const limit = 20;

  // Notes: Load logs when page mounts or pagination changes
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
        const overrideParam =
          overrideFilter === 'yes' ? true : overrideFilter === 'no' ? false : undefined;
        const filters: Record<string, unknown> = {
          skip,
          limit,
          agent_name: agentFilter || undefined,
          status: statusFilter || undefined,
          date_range: startDate && endDate ? `${startDate},${endDate}` : undefined,
          flagged_only: flaggedOnly || undefined,
          fallback_used: fallbackFilter === 'all' ? undefined : fallbackFilter === 'yes',
          override: overrideParam
        };
        const data = await getFilteredOrchestrationLogs(token, filters);
        setLogs(data);
      } catch {
        setError('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, skip, overrideFilter, agentFilter, statusFilter, startDate, endDate, fallbackFilter, flaggedOnly]);

  const fmt = (iso: string) => new Date(iso).toLocaleString();
  const sorted = [...logs]
    .filter((l) =>
      agentFilter ? l.agent_name.includes(agentFilter) : true
    )
    .filter((l) =>
      overrideFilter === 'all'
        ? true
        : overrideFilter === 'yes'
        ? l.override_triggered
        : !l.override_triggered
    )
    .sort((a, b) => {
      const res = a[sortField] < b[sortField] ? -1 : a[sortField] > b[sortField] ? 1 : 0;
      return sortAsc ? res : -res;
    });
  const toggleSort = (field: keyof PerfLog) => {
    if (field === sortField) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };
  const badge = (status: string) => {
    const color =
      status === 'success'
        ? 'bg-green-200'
        : status === 'failed'
        ? 'bg-red-200'
        : 'bg-yellow-200';
    return <span className={`px-2 py-1 rounded ${color}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Back link */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Orchestration Performance Logs</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {/* Filter and table when data is loaded */}
      {!loading && !error && sorted.length === 0 && <p>No logs found.</p>}
      {!loading && !error && sorted.length > 0 && (
        <div className="overflow-x-auto w-full max-h-[70vh]">
          <input
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            placeholder="Filter by agent"
            className="border p-1 mb-2 rounded"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-1 mb-2 rounded ml-2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-1 mb-2 rounded ml-2"
          />
          <input
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Status"
            className="border p-1 mb-2 rounded ml-2"
          />
          <select
            value={overrideFilter}
            onChange={(e) => setOverrideFilter(e.target.value)}
            className="border p-1 mb-2 rounded ml-2"
          >
            <option value="all">All</option>
            <option value="yes">Overrides</option>
            <option value="no">Normal</option>
          </select>
          <select
            value={fallbackFilter}
            onChange={(e) => setFallbackFilter(e.target.value)}
            className="border p-1 mb-2 rounded ml-2"
          >
            <option value="all">Fallback?</option>
            <option value="yes">Used</option>
            <option value="no">Not Used</option>
          </select>
          <label className="ml-2 text-sm">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="mr-1"
            />
            Flagged
          </label>
          <button
            onClick={async () => {
              const token = getToken();
              if (!token) return;
              const data = await exportOrchestrationLogsCSV(token, {
                agent_name: agentFilter || undefined,
                status: statusFilter || undefined,
                date_range: startDate && endDate ? `${startDate},${endDate}` : undefined,
                flagged_only: flaggedOnly || undefined,
                fallback_used: fallbackFilter === 'all' ? undefined : fallbackFilter === 'yes'
              });
              const url = window.URL.createObjectURL(data);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'orchestration_logs.csv';
              a.click();
            }}
            className="px-3 py-1 border rounded ml-2"
          >
            Export CSV
          </button>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('timestamp')}>Timestamp</th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('agent_name')}>Agent</th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('execution_time_ms')}>Exec ms</th>
                <th className="px-4 py-2">In</th>
                <th className="px-4 py-2">Out</th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => toggleSort('status')}>Status</th>
                <th className="px-4 py-2">Fallback</th>
                <th className="px-4 py-2">Timeout</th>
                <th className="px-4 py-2">Retries</th>
                <th className="px-4 py-2">Override</th>
                <th className="px-4 py-2">Replay</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((log) => (
                <tr
                  key={log.id}
                  className={`odd:bg-gray-100 text-center ${log.timeout_occurred ? 'bg-orange-100' : ''}`}
                >
                  <td className="border px-2 py-1">{fmt(log.timestamp)}</td>
                  <td className="border px-2 py-1">{log.agent_name}</td>
                  <td className="border px-2 py-1">{log.execution_time_ms}</td>
                  <td className="border px-2 py-1">{log.input_tokens}</td>
                  <td className="border px-2 py-1">{log.output_tokens}</td>
                  <td className="border px-2 py-1">{badge(log.status)}</td>
                  <td className="border px-2 py-1">
                    {log.fallback_triggered ? 'Yes' : 'No'}
                  </td>
                  <td className="border px-2 py-1">
                    {log.timeout_occurred ? (
                      <span className="px-2 py-1 rounded bg-red-200">Timeout</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {log.retries > 0 ? (
                      <span className="px-2 py-1 rounded bg-yellow-200">{log.retries}</span>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td
                    className="border px-2 py-1 cursor-pointer text-blue-600 underline"
                    onClick={async () => {
                      const token = getToken();
                      if (!token) return;
                      const hist = await getOverrideHistory(
                        token,
                        log.user_id,
                        log.agent_name
                      );
                      setHistoryModal(hist as PerfLog[]);
                    }}
                  >
                {log.override_triggered ? 'Yes' : 'No'}
              </td>
              <td className="border px-2 py-1">
                <button
                  className="text-blue-600 underline"
                  onClick={async () => {
                    const token = getToken();
                    if (!token) return;
                    const data = await replayOrchestration(token, log.id);
                    setReplayModal(data);
                  }}
                >
                  Replay
                </button>
              </td>
            </tr>
          ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && (
        <div className="flex space-x-4">
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setSkip(skip + limit)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      )}
      {historyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow max-h-[70vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-2">Override History</h2>
            <table className="text-sm border divide-y divide-gray-200 mb-2">
              <thead>
                <tr>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Reason</th>
                </tr>
              </thead>
              <tbody>
                {historyModal.map((h) => (
                  <tr key={h.id} className="odd:bg-gray-100 text-center">
                    <td className="border px-2 py-1">{fmt(h.timestamp)}</td>
                    <td className="border px-2 py-1">{h.override_reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="px-3 py-1 border rounded" onClick={() => setHistoryModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
      {replayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow max-w-md space-y-2">
            <h2 className="text-lg font-bold">Replay Output</h2>
            <pre className="whitespace-pre-wrap border p-2 rounded max-h-60 overflow-auto">
              {replayModal.outputs.summary}\n\n{replayModal.outputs.reflection}
            </pre>
            <p className="text-sm">Runtime: {replayModal.meta.runtime_ms} ms</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${replayModal.outputs.summary}\n${replayModal.outputs.reflection}`
                  );
                }}
                className="px-3 py-1 border rounded"
              >
                Copy
              </button>
              <button onClick={() => setReplayModal(null)} className="px-3 py-1 border rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Footnote: Presents orchestration performance telemetry for admins.

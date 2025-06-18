'use client';

// Audit timeline for a specific journal summary
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, isAdmin } from '../../../../services/authUtils';
import { getSummaryAuditTrail } from '../../../../services/apiClient';
import { showError } from '../../../../components/ToastProvider';
import { FiEdit2, FiFlag, FiRepeat, FiMessageSquare } from 'react-icons/fi';

interface AuditRow {
  timestamp: string;
  event_type: string;
  actor: string | null;
  metadata: Record<string, unknown>;
}

export default function SummaryAuditPage({ params }: { params: { summaryId: string } }) {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditRow[]>([]);
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
        const data = await getSummaryAuditTrail(params.summaryId, token);
        setLogs(data);
      } catch {
        setError('Failed to load audit trail');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, params.summaryId]);

  const iconFor = (t: string) => {
    switch (t) {
      case 'edit':
        return <FiEdit2 />;
      case 'annotate':
        return <FiMessageSquare />;
      case 'override':
        return <FiRepeat />;
      case 'flag':
        return <FiFlag />;
      default:
        return <FiEdit2 />;
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href={`/admin/journal-summaries/${params.summaryId}`} className="self-start text-blue-600 underline">
        Back
      </Link>
      <div className="flex gap-4">
        <Link href={`/admin/journal-summaries/${params.summaryId}`}>Summary</Link>
        <Link href={`/admin/journal-summaries/${params.summaryId}/override`}>Notes</Link>
        <span className="font-bold">Audit</span>
      </div>
      <h1 className="text-2xl font-bold">Audit Trail</h1>
      {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No audit logs found.</p>}
      {!loading && !error && logs.length > 0 && (
        <ol className="border-l border-gray-300 space-y-2 w-full max-w-md">
          {logs.map((log, idx) => (
            <li key={idx} className="ml-4 relative">
              <span className="absolute -left-3 top-1 text-gray-600">
                {iconFor(log.event_type)}
              </span>
              <div className="bg-gray-50 p-2 rounded-md">
                <div className="text-sm text-gray-500">{fmt(log.timestamp)}</div>
                <div className="font-medium">{log.event_type}</div>
                {log.actor && <div className="text-xs">by {log.actor}</div>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

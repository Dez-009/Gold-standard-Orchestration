'use client';

// Admin viewer showing diff between summary versions
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, isAdmin } from '../../../../services/authUtils';
import { getSummaryDiff } from '../../../../services/apiClient';
import { showError, showSuccess } from '../../../../components/ToastProvider';

export default function SummaryDiffPage({
  params
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [diff, setDiff] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch diff on mount ensuring admin authentication
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      try {
        const data = await getSummaryDiff(params.id, token);
        setDiff(data.diff);
      } catch {
        showError('Failed to load diff');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(diff);
    showSuccess('Diff copied');
  };

  return (
    <div className="flex flex-col min-h-screen p-4 space-y-4">
      <Link
        href={`/admin/journal-summaries/${params.id}`}
        className="self-start text-blue-600 underline"
      >
        Back
      </Link>
      <h1 className="text-2xl font-bold">Summary Diff</h1>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {!loading && (
        <div className="flex flex-col gap-2 w-full">
          <button onClick={handleCopy} className="self-end px-3 py-1 border rounded">
            Copy Diff
          </button>
          <div
            className="overflow-auto font-mono text-sm"
            dangerouslySetInnerHTML={{ __html: diff }}
          />
        </div>
      )}
    </div>
  );
}


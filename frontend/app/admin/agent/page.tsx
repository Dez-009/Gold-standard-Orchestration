'use client';
// Admin page providing a console to query the backend admin agent

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { queryAdminAgent } from '../../../services/adminAgentService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

export default function AdminAgentPage() {
  const router = useRouter();
  // Notes: Local state storing the prompt and the response payload
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Notes: Ensure an admin token is present before allowing access
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  // Notes: Submit the prompt to the backend and store the response
  const handleSubmit = async () => {
    const token = getToken();
    if (!token) {
      showError('Something went wrong');
      return;
    }
    try {
      setLoading(true);
      const data = await queryAdminAgent(prompt);
      setResult(data);
    } catch {
      showError('Failed to run query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Admin Agent</h1>
      {/* Prompt input box */}
      <textarea
        className="w-full max-w-2xl border rounded p-2"
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask a question..."
      />
      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Submit'}
      </button>
      {/* Display the JSON response */}
      {result && (
        <pre className="w-full max-w-2xl bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

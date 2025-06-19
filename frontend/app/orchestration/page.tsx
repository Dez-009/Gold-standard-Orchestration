'use client';
// Page exposing the full multi-agent orchestration demo
// Requires authentication and sends prompts to the orchestration service

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { askVida } from '../../services/orchestrationService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

export default function OrchestrationPage() {
  const router = useRouter();
  // Notes: Track the current prompt typed by the user
  const [prompt, setPrompt] = useState('');
  // Notes: Store the aggregated response returned by the backend
  const [response, setResponse] = useState('');
  // Notes: Display a spinner while waiting for the API call
  const [loading, setLoading] = useState(false);
  // Notes: Hold any error message for display
  const [error, setError] = useState('');

  // Notes: Verify the JWT token on initial page load
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  // Notes: Submit the prompt to the orchestration service
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResponse('');
    try {
      const text = await askVida(prompt);
      setResponse(text);
    } catch {
      setError('Failed to fetch response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Vida Coach Orchestration Demo</h1>

      {/* Form for entering the user prompt */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Vida anything..."
          className="border rounded w-full p-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Ask Vida
        </button>
      </form>

      {/* Loading spinner while waiting for response */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}

      {/* Error message when the API call fails */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Display the aggregated response in a card */}
      {response && (
        <div className="border rounded p-4 shadow-md bg-gray-50 w-full max-w-md">
          {response}
        </div>
      )}
    </div>
  );
}

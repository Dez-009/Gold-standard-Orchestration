'use client';
// Chat page displaying multi-agent AI responses
// Notes: Users must be authenticated to interact with this page
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendOrchestrationPrompt } from '../../services/aiOrchestrationService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

interface AgentResponse {
  agent: string;
  response: string;
}

export default function ChatPage() {
  const router = useRouter(); // Notes: Router for redirects
  // Notes: Track user input
  const [prompt, setPrompt] = useState('');
  // Notes: Hold the list of agent responses returned by the backend
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  // Notes: Show spinner while waiting for the API
  const [loading, setLoading] = useState(false);
  // Notes: Record any error message when the request fails
  const [error, setError] = useState('');

  // Notes: Verify the token once on mount
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  // Notes: Submit handler calling the orchestration service
  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await sendOrchestrationPrompt(prompt);
      setResponses(data.responses);
    } catch (err) {
      showError('Failed to fetch response');
      setError('Unable to get a reply.');
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

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Multi-Agent Chat</h1>

      <div className="flex flex-col w-full max-w-2xl space-y-4">
        <textarea
          className="border rounded p-2"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
        {error && <p className="text-red-600">{error}</p>}
        {loading && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        )}
      </div>

      {/* Display each agent response in its own card */}
      <div className="w-full max-w-2xl space-y-4">
        {responses.map((r, idx) => (
          <div key={idx} className="p-4 border rounded shadow bg-white">
            <h3 className="font-semibold mb-2">{r.agent}</h3>
            <p>{r.response}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

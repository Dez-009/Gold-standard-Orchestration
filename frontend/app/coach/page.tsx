'use client';
// Page implementing a chat interface that uses the AI orchestration service
// Notes: Users must be authenticated before interacting with the chat
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { routeAiRequest } from '../../services/aiOrchestrationService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

// Notes: Type describing each chat message in the history
interface Message {
  sender: 'user' | 'ai';
  text: string;
  agent?: string;
}

export default function CoachPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Notes: Track the contents of the message input box
  const [prompt, setPrompt] = useState('');
  // Notes: Store the conversation history displayed on screen
  const [messages, setMessages] = useState<Message[]>([]);
  // Notes: Show a spinner while waiting for the API response
  const [loading, setLoading] = useState(false);
  // Notes: Hold an error message when the request fails
  const [error, setError] = useState('');

  // Notes: On mount, verify token validity and redirect if needed
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  // Notes: Handler for submitting the user's message
  const handleSend = async () => {
    if (!prompt.trim()) return;
    // Notes: Optimistically add the user's message to the history
    setMessages((msgs) => [...msgs, { sender: 'user', text: prompt }]);
    setPrompt('');
    setLoading(true);
    setError('');
    try {
      // Notes: Send the prompt through the orchestration service
      const { agent, response } = await routeAiRequest(prompt);
      // Notes: Append the AI response along with the agent name
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: response, agent }
      ]);
    } catch (err) {
      // Notes: Display a toast and store error state on failure
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

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Coaching Chat</h1>

      <div className="flex flex-col md:flex-row w-full max-w-2xl space-y-4 md:space-y-0 md:space-x-4">
        {/* Message history column */}
        <div className="flex-1 border rounded p-4 space-y-2 overflow-y-auto h-96 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.sender === 'user' ? 'text-right' : 'text-left'}>
              {msg.sender === 'ai' && (
                <p className="font-semibold text-indigo-600">{msg.agent}</p>
              )}
              <p className="inline-block px-3 py-2 rounded bg-white shadow">
                {msg.text}
              </p>
            </div>
          ))}
          {loading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto" />
          )}
        </div>

        {/* Input column */}
        <div className="flex-1 flex flex-col space-y-2">
          <textarea
            className="border rounded p-2 flex-grow"
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
        </div>
      </div>
    </div>
  );
}

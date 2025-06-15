// Page providing a simple interface for AI coaching prompts
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getAiResponse } from '../../services/aiCoachService';

export default function CoachPage() {
  // Local state for the prompt text entered by the user
  const [prompt, setPrompt] = useState('');
  // Local state for the displayed AI response
  const [response, setResponse] = useState('AI response will appear here');
  // Track loading state while waiting for backend
  const [loading, setLoading] = useState(false);
  // Track error message on failure
  const [error, setError] = useState('');

  // Handler for sending the prompt
  const handleSend = async () => {
    // Reset status and show spinner
    setLoading(true);
    setError('');
    try {
      // Fetch the AI response from the backend service
      const aiText = await getAiResponse(prompt);
      setResponse(aiText);
    } catch (err) {
      // Show generic error message if request fails
      setError('Failed to fetch AI response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Title of the page */}
      <h1 className="text-2xl font-bold">AI Coach</h1>

      {/* Text area for user prompt */}
      <textarea
        className="border rounded p-2 w-full max-w-md"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask a question..."
      />

      {/* Button to submit the prompt */}
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send Prompt
      </button>
      {/* Display spinner during API call */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Display error message if fetch failed */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Area showing the AI response */}
      <div className="border rounded p-4 bg-gray-100 w-full max-w-md text-center">
        {response}
      </div>
    </div>
  );
}

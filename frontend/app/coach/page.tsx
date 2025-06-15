// Page providing a simple interface for AI coaching prompts
'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function CoachPage() {
  // Local state for the prompt text entered by the user
  const [prompt, setPrompt] = useState('');
  // Local state for the displayed AI response
  const [response, setResponse] = useState('AI response will appear here');

  // Handler for sending the prompt
  const handleSend = () => {
    // For now we simply set a static placeholder response
    setResponse('This is a placeholder AI response.');
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

      {/* Area showing the AI response */}
      <div className="border rounded p-4 bg-gray-100 w-full max-w-md text-center">
        {response}
      </div>
    </div>
  );
}

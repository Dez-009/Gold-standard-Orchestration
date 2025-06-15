'use client';
// Page displaying AI-generated goal suggestions
// Fetches suggestions from the backend on mount and lists them

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAiSuggestions } from '../../services/aiSuggestionService';

export default function SuggestionsPage() {
  // Store the suggestion strings returned by the API
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // Track loading state while waiting for the network request
  const [loading, setLoading] = useState(true);
  // Hold any error message encountered during fetch
  const [error, setError] = useState('');

  // Retrieve suggestions once on component mount
  useEffect(() => {
    const load = async () => {
      try {
        // Fetch raw suggestion text from the service
        const text = await fetchAiSuggestions();
        // Split the newline-delimited text into individual suggestions
        const list = text
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
        setSuggestions(list);
      } catch {
        // Generic error message shown to the user
        setError('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Placeholder handler for accepting a suggestion
  const handleAccept = (suggestion: string) => {
    alert(`Accepted: ${suggestion}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Goal Suggestions</h1>

      {/* Conditional rendering for loading, error and empty states */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && suggestions.length === 0 && <p>No suggestions available.</p>}

      {/* Render each suggestion with an Accept button */}
      <ul className="w-full max-w-md space-y-2">
        {suggestions.map((s, idx) => (
          <li
            key={idx}
            className="border rounded p-4 bg-gray-100 flex justify-between items-center"
          >
            <span>{s}</span>
            <button
              onClick={() => handleAccept(s)}
              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
            >
              Accept
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

'use client';
// Page allowing users to submit product feedback

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendFeedback } from '../../services/feedbackService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

const types = ['Bug', 'Feature Request', 'Praise', 'Complaint', 'Other'];

export default function FeedbackPage() {
  const router = useRouter();
  // Selected feedback category
  const [type, setType] = useState('Bug');
  // Message text from the textarea
  const [message, setMessage] = useState('');
  // UI state flags
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Ensure session validity on mount for nicer user experience
  // Anonymous users are also allowed so we only redirect if token exists but expired
  const token = getToken();
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token');
    showError('Session expired. Please login again.');
    router.push('/login');
  }

  // Submit the feedback to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await sendFeedback(type, message);
      setMessage('');
      setSuccess(true);
    } catch {
      setError('Failed to submit feedback');
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
      <h1 className="text-2xl font-bold">Submit Feedback</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded w-full p-2"
        >
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your feedback"
          className="border rounded w-full p-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </form>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Thank you for your feedback!</p>}
    </div>
  );
}

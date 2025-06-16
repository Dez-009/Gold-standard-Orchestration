'use client';
// Support page allowing users to submit help tickets
// Notes: Displays a simple form and shows feedback based on submission result

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { submitTicket } from '../../services/supportService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

export default function SupportPage() {
  const router = useRouter(); // Notes: Used for redirecting on session expiry
  // Track form field values for the ticket subject, category, and message
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Billing');
  const [message, setMessage] = useState('');
  // Local state for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verify a valid session token is present when the page loads
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  // Handle submission of the support request form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // Notes: Delegate ticket creation to the support service helper
      await submitTicket(subject, category, message);
      setSubject('');
      setCategory('Billing');
      setMessage('');
      setSuccess(true);
    } catch {
      setError('Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Support Ticket</h1>

      {/* Form for entering ticket details */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="border rounded w-full p-2"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded w-full p-2"
        >
          <option>Billing</option>
          <option>Technical</option>
          <option>Coaching</option>
          <option>Other</option>
        </select>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          className="border rounded w-full p-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>

      {/* Loading spinner and status messages */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Ticket submitted!</p>}
    </div>
  );
}

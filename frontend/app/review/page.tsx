'use client';
// Weekly review page showing the most recent review entry
// Fetches data from the backend on mount and handles loading states
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWeeklyReview } from '../../services/reviewService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

interface Review {
  id: number;
  content: string;
  created_at: string;
}

export default function ReviewPage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Local state holding the fetched review object
  const [review, setReview] = useState<Review | null>(null);
  // Track whether the page is currently loading data
  const [loading, setLoading] = useState(true);
  // Store an error message if the fetch fails
  const [error, setError] = useState('');

  // On initial render, attempt to retrieve the weekly review
  // Notes: Validate session then load the latest review
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const loadReview = async () => {
      try {
        const data = await fetchWeeklyReview();
        setReview(data);
      } catch {
        setError('Failed to load weekly review');
      } finally {
        setLoading(false);
      }
    };
    loadReview();
  }, [router]);

  // Helper to format the ISO timestamp returned by the backend
  const formatDate = (iso: string) => iso.split('T')[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation link back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Title header for the page */}
      <h1 className="text-2xl font-bold">Weekly Review</h1>

      {/* Display spinner while fetching data */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Display an error message when the request fails */}
      {error && <p className="text-red-600">{error}</p>}
      {/* Inform the user when no review has been created yet */}
      {!loading && !error && !review && <p>No review available yet.</p>}

      {/* Render the review content and creation date when available */}
      {review && (
        <div className="border rounded p-4 bg-gray-100 w-full max-w-md">
          <p>{review.content}</p>
          <p className="text-sm text-gray-600 mt-2">{formatDate(review.created_at)}</p>
        </div>
      )}
    </div>
  );
}

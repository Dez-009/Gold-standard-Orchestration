'use client';
// Page allowing the user to select agent personalities per domain

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setPersonality, fetchPersonality } from '../../services/agentPersonalityService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

// Static dropdown options representing domains
const domains = ['career', 'health', 'relationships', 'finance'];
// Static personalities to choose from for now
const personalities = ['Friendly', 'Direct', 'Encouraging'];

export default function AgentPersonalityPage() {
  const router = useRouter();
  // Notes: Local state for selected domain and personality
  const [domain, setDomain] = useState(domains[0]);
  const [personality, setPersonalityName] = useState(personalities[0]);
  // Notes: Display loading indicator and error message
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Attempt to load existing assignment on mount
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      try {
        const data = await fetchPersonality(domain);
        setPersonalityName(data.personality as string);
      } catch {
        // Ignore if not found
      }
    };
    load();
  }, [router, domain]);

  // Submit updated assignment to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await setPersonality(domain, personality);
      router.push('/dashboard');
    } catch {
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold">Agent Personality</h1>

      {/* Form selecting domain and personality */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="flex flex-col">
          <label htmlFor="domain" className="mb-1 font-medium">
            Domain
          </label>
          <select
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="border rounded p-2"
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="personality" className="mb-1 font-medium">
            Personality
          </label>
          <select
            id="personality"
            value={personality}
            onChange={(e) => setPersonalityName(e.target.value)}
            className="border rounded p-2"
          >
            {personalities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </form>

      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}

'use client';
// Page allowing users to edit personalization profiles per agent

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchPersonalizations, updatePersonalization } from '../../../services/personalizationService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface Personalization {
  id: string;
  agent_name: string;
  personality_profile: string;
}

export default function PersonalizationPage() {
  const router = useRouter();
  // Notes: Store list of available agents returned from the backend
  const [agents, setAgents] = useState<string[]>([]);
  // Notes: Map of agent names to profile text
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  // Notes: Currently selected agent in the dropdown
  const [selected, setSelected] = useState('');
  // Notes: Track textarea content for editing
  const [profileText, setProfileText] = useState('');
  // Notes: Loading and error indicators
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available agents and profiles on initial render
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPersonalizations();
        setAgents(data.agents as string[]);
        const map: Record<string, string> = {};
        (data.profiles as Personalization[]).forEach((p) => {
          map[p.agent_name] = p.personality_profile;
        });
        setProfiles(map);
        if (data.agents.length > 0) {
          const first = data.agents[0] as string;
          setSelected(first);
          setProfileText(map[first] || '');
        }
      } catch {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  // Save the profile for the selected agent
  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await updatePersonalization(selected, profileText);
      setProfiles({ ...profiles, [selected]: profileText });
    } catch {
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to the account page */}
      <Link href="/account" className="self-start text-blue-600 underline">
        Back to Account
      </Link>

      <h1 className="text-2xl font-bold">Personalization Settings</h1>

      {/* Show spinner when loading */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Display error message if one occurred */}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && agents.length > 0 && (
        <div className="w-full max-w-md space-y-4 border rounded p-4 bg-gray-50">
          <div className="flex flex-col">
            <label htmlFor="agent" className="mb-1 font-medium">
              Agent
            </label>
            <select
              id="agent"
              value={selected}
              onChange={(e) => {
                const name = e.target.value;
                setSelected(name);
                setProfileText(profiles[name] || '');
              }}
              className="border rounded p-2"
            >
              {agents.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="profile" className="mb-1 font-medium">
              Personality Profile
            </label>
            <textarea
              id="profile"
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              className="border rounded p-2 h-32"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}


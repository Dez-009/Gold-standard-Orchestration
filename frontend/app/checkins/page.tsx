'use client';
// Page for submitting and viewing health check-ins

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { submitCheckinEntry, getCheckins } from '../../services/dailyCheckinService';
import { showError } from '../../components/ToastProvider';

interface Checkin {
  id: string;
  mood: string;
  energy_level: number;
  stress_level: number;
  notes?: string | null;
  created_at: string;
}

// Component rendering the check-in form and history list
export default function CheckinsPage() {
  const router = useRouter();
  const [mood, setMood] = useState('EXCELLENT');
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(false);

  // On mount ensure the user is logged in and fetch existing check-ins
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
        const data = await getCheckins();
        setHistory(data as Checkin[]);
      } catch {
        // ignore load failures
      }
    };
    load();
  }, [router]);

  // Submit the form data to the backend then refresh history
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitCheckinEntry({
        mood,
        energy_level: energy,
        stress_level: stress,
        notes,
      });
      const data = await getCheckins();
      setHistory(data as Checkin[]);
      setNotes('');
    } catch {
      showError('Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Daily Check-Ins</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <select value={mood} onChange={(e) => setMood(e.target.value)} className="border p-2 rounded">
          <option value="EXCELLENT">Excellent</option>
          <option value="GOOD">Good</option>
          <option value="OKAY">Okay</option>
          <option value="STRUGGLING">Struggling</option>
          <option value="BAD">Bad</option>
        </select>
        <input type="number" min="1" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="border p-2 rounded w-full" placeholder="Energy level" />
        <input type="number" min="1" max="10" value={stress} onChange={(e) => setStress(Number(e.target.value))} className="border p-2 rounded w-full" placeholder="Stress level" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="border p-2 rounded w-full" placeholder="Notes (optional)" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          Submit
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {history.map((c) => (
          <div key={c.id} className="border p-2 rounded bg-gray-50">
            <p className="font-semibold">Mood: {c.mood}</p>
            <p>Energy: {c.energy_level} / Stress: {c.stress_level}</p>
            {c.notes && <p className="italic">{c.notes}</p>}
            <p className="text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
// Habit tracker page allowing creation and logging of habits
// Loads existing habits on mount and provides simple logging controls

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { saveHabit, fetchHabits, logUserHabit, removeHabit } from '../../services/habitService';
import { getToken, parseUserFromToken } from '../../services/authUtils';

interface Habit {
  id: number;
  habit_name: string;
  frequency: string;
  streak_count: number;
}

export default function HabitsPage() {
  // Current list of habits for the user
  const [habits, setHabits] = useState<Habit[]>([]);
  // Track the input fields for a new habit
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('daily');
  // Flags for loading state and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to load habits from the backend
  const loadHabits = async (userId: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchHabits(userId);
      setHabits(data);
    } catch {
      setError('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  // On mount, fetch habits for the logged in user
  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }
    const userId = parseUserFromToken(token)?.id;
    if (!userId) {
      return;
    }
    loadHabits(userId);
  }, []);

  // Handler for creating a new habit
  const handleCreate = async () => {
    const token = getToken();
    if (!token) return;
    const userId = parseUserFromToken(token)?.id;
    if (!userId) return;
    try {
      const habit = await saveHabit(name, frequency, userId);
      setHabits([...habits, habit]);
      setName('');
    } catch {
      setError('Failed to create habit');
    }
  };

  // Handler to log a habit occurrence
  const handleLog = async (id: number) => {
    try {
      const updated = await logUserHabit(id);
      setHabits(habits.map(h => (h.id === id ? { ...h, streak_count: updated.streak_count } : h)));
    } catch {
      setError('Failed to log habit');
    }
  };

  // Handler to delete a habit
  const handleDelete = async (id: number) => {
    try {
      await removeHabit(id);
      setHabits(habits.filter(h => h.id !== id));
    } catch {
      setError('Failed to delete habit');
    }
  };

  const formatDate = (iso: string) => iso.split('T')[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Habit Tracker</h1>

      {/* Form to add a new habit */}
      <div className="space-x-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Habit name"
          className="border p-2"
        />
        <select value={frequency} onChange={e => setFrequency(e.target.value)} className="border p-2">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Habit
        </button>
      </div>

      {/* Loading and error indicators */}
      {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />}
      {error && <p className="text-red-600">{error}</p>}

      {/* List of habits with log and delete controls */}
      <ul className="w-full max-w-md space-y-2">
        {habits.map(habit => (
          <li key={habit.id} className="border rounded p-4 bg-gray-100">
            <p className="font-semibold">{habit.habit_name}</p>
            <p className="text-sm text-gray-600">Frequency: {habit.frequency}</p>
            <p className="text-sm">Streak: {habit.streak_count}</p>
            <div className="space-x-2 mt-2">
              <button onClick={() => handleLog(habit.id)} className="text-blue-600 underline">
                Log
              </button>
              <button onClick={() => handleDelete(habit.id)} className="text-red-600 underline">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

'use client';
/**
 * Admin UI for managing persona presets.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import {
  fetchPersonaPresets,
  savePersonaPreset,
  modifyPersonaPreset,
  removePersonaPreset
} from '../../../services/personaPresetService';
import { showError } from '../../../components/ToastProvider';

interface PresetRow {
  id: string;
  name: string;
  description: string;
  traits: Record<string, number>;
  created_at: string;
}

export default function PersonaPresetPage() {
  const router = useRouter();
  const [presets, setPresets] = useState<PresetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', traits: {} as Record<string, number> });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load presets on mount and verify admin token
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPersonaPresets();
        setPresets(data as PresetRow[]);
      } catch {
        setError('Failed to load presets');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Handle save for create or update
  const handleSave = async () => {
    try {
      if (editingId) {
        const updated = await modifyPersonaPreset(editingId, form);
        setPresets((prev) => prev.map((p) => (p.id === editingId ? (updated as PresetRow) : p)));
      } else {
        const created = await savePersonaPreset(form);
        setPresets((prev) => [...prev, created as PresetRow]);
      }
      setForm({ name: '', description: '', traits: {} });
      setEditingId(null);
    } catch {
      // Error toast shown in service
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this preset?')) return;
    try {
      await removePersonaPreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // Error toast shown in service
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Persona Presets</h1>
      {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-4 w-full max-w-3xl">
          {presets.map((p) => (
            <div key={p.id} className="border p-3 rounded shadow space-y-2">
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-sm">{p.description}</p>
              <div className="space-y-1">
                {Object.entries(p.traits).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">{fmt(p.created_at)}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setForm({ name: p.name, description: p.description, traits: p.traits });
                  }}
                  className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-2 py-1 text-sm bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="border p-4 rounded w-full max-w-md space-y-2">
        <h2 className="font-semibold">{editingId ? 'Edit Preset' : 'New Preset'}</h2>
        <input
          className="border p-1 w-full"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          className="border p-1 w-full"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="space-y-1">
          {['empathy', 'optimism', 'humor'].map((trait) => (
            <div key={trait} className="flex items-center space-x-2">
              <label className="capitalize w-24 text-sm">{trait}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={form.traits[trait] || 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    traits: { ...form.traits, [trait]: parseFloat(e.target.value) }
                  })
                }
                className="flex-1"
              />
              <span className="text-sm w-8 text-right">{form.traits[trait] || 0}</span>
            </div>
          ))}
        </div>
        <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded">
          Save
        </button>
      </div>
    </div>
  );
}

// Footnote: Displays and edits persona presets with trait sliders.

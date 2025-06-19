'use client';
/**
 * Admin page listing versioned prompt templates for each agent.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchPromptVersions, createPromptVersion } from '../../../services/promptService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError } from '../../../components/ToastProvider';

interface PromptRow {
  id: string;
  agent_name: string;
  version: string;
  metadata: any;
  created_at: string;
  prompt_template: string;
}

export default function PromptVersionPage() {
  const router = useRouter();
  // Notes: Table rows and modal form state
  const [rows, setRows] = useState<PromptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [version, setVersion] = useState('');
  const [template, setTemplate] = useState('');
  const [metadata, setMetadata] = useState('{}');

  // Notes: Load all versions on initial render
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
        const data = await fetchPromptVersions('');
        setRows(data);
      } catch {
        setError('Failed to load prompts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Notes: Validate and submit the new version form
  const handleSave = async () => {
    if (!agentName || !version || !template) {
      showError('All fields are required');
      return;
    }
    try {
      const parsed = metadata ? JSON.parse(metadata) : undefined;
      await createPromptVersion({ agentName, version, template, metadata: parsed });
      const data = await fetchPromptVersions('');
      setRows(data);
      setShowModal(false);
      setAgentName('');
      setVersion('');
      setTemplate('');
      setMetadata('{}');
    } catch {
      showError('Failed to save prompt');
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Navigation */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Heading */}
      <h1 className="text-2xl font-bold">Prompt Versions</h1>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add Version
      </button>
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && rows.length === 0 && <p>No versions found.</p>}
      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Version</th>
                <th className="px-4 py-2">Tags</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="odd:bg-gray-100">
                  <td className="border px-4 py-2">{r.agent_name}</td>
                  <td className="border px-4 py-2">{r.version}</td>
                  <td className="border px-4 py-2">
                    {r.metadata && r.metadata.tags ? r.metadata.tags.join(', ') : '-'}
                  </td>
                  <td className="border px-4 py-2">{fmt(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 space-y-2 rounded w-96">
            <h2 className="text-xl font-bold">New Version</h2>
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Agent Name"
              className="border p-1 w-full rounded"
            />
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Version"
              className="border p-1 w-full rounded"
            />
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Prompt Template"
              className="border p-1 w-full rounded"
              rows={3}
            />
            <textarea
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder="Metadata JSON"
              className="border p-1 w-full rounded"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Footnote: Minimal UI for tracking and adding prompt template versions.

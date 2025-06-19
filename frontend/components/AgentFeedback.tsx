'use client';
// Component allowing a user to rate an AI generated summary

import { useEffect, useState } from 'react';
import { fetchAgentFeedback, submitAgentFeedback } from '../services/agentFeedbackService';

interface AgentFeedbackProps {
  summaryId: string;
}

// Available emoji reactions displayed in the bar
const EMOJIS = ['👍', '👎', '😐', '😍', '😢'];

export default function AgentFeedback({ summaryId }: AgentFeedbackProps) {
  // Track selected reaction and optional comment text
  const [reaction, setReaction] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<null | { emoji_reaction: string; feedback_text?: string }>(null);

  // Load previously submitted feedback if present
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAgentFeedback(summaryId);
        setExisting(data as any);
      } catch {
        // Ignore 404 when no feedback exists
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [summaryId]);

  // Disable inputs when feedback already exists
  const disabled = submitting || !!existing;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitAgentFeedback({ summary_id: summaryId, emoji_reaction: reaction, feedback_text: comment });
      setExisting({ emoji_reaction: reaction, feedback_text: comment });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-10" />; // spacer while loading
  }

  if (existing) {
    return (
      <div className="mt-4 text-sm text-gray-600">
        You reacted {existing.emoji_reaction}
        {existing.feedback_text && ` - ${existing.feedback_text}`}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {/* Emoji reaction selection bar */}
      <div className="flex space-x-2">
        {EMOJIS.map((e) => (
          <button
            key={e}
            disabled={disabled}
            className={`text-2xl ${reaction === e ? 'opacity-100' : 'opacity-50'}`}
            onClick={() => setReaction(e)}
          >
            {e}
          </button>
        ))}
      </div>
      {/* Optional free text comment */}
      <textarea
        className="w-full border rounded p-2"
        placeholder="Additional thoughts (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={disabled}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !reaction}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        {submitting ? 'Saving...' : 'Submit'}
      </button>
    </div>
  );
}

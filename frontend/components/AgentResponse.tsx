'use client';
// Component displaying an agent's reply with timeout fallback
import React from 'react';

// Notes: Shape of data passed to the component
interface AgentReply {
  agent: string;
  status: string;
  content: string;
}

interface Props {
  reply: AgentReply;
  loading: boolean;
  onRetry: () => void;
}

export default function AgentResponse({ reply, loading, onRetry }: Props) {
  // Notes: Render placeholder skeleton while waiting for data
  if (loading) {
    return <div className="h-24 rounded bg-gray-100 animate-pulse" />;
  }

  // Notes: Show warning UI when the agent timed out
  if (reply.status === 'timeout') {
    return (
      <div className="p-4 border rounded bg-yellow-50 text-sm space-y-2">
        <p>⚠️ This response was delayed. Try again later.</p>
        <button onClick={onRetry} className="text-orange-700 underline">
          Retry
        </button>
      </div>
    );
  }

  // Notes: Normal successful response rendering
  return (
    <div className="p-4 border rounded shadow bg-white">
      <h3 className="font-semibold mb-2">{reply.agent}</h3>
      <p>{reply.content}</p>
    </div>
  );
}

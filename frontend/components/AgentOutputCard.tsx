'use client';
// Card component displaying an agent's text output with optional retry/timeout alert
import React, { useEffect, useState } from 'react';

interface Props {
  text: string;
  timeoutOccurred: boolean;
  retryCount: number;
}

export default function AgentOutputCard({ text, timeoutOccurred, retryCount }: Props) {
  // Track whether the notification banner should be visible
  const [showNotice, setShowNotice] = useState(true);

  // Hide the notice automatically after 10 seconds
  useEffect(() => {
    if (timeoutOccurred || retryCount > 0) {
      const timer = setTimeout(() => setShowNotice(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [timeoutOccurred, retryCount]);

  return (
    <div className="p-4 border rounded shadow bg-white space-y-2">
      {/* Optional notice banner shown when a timeout or retry occurred */}
      {showNotice && (timeoutOccurred || retryCount > 0) && (
        <div
          className="flex items-center space-x-2 p-2 border-l-4 bg-yellow-50 border-yellow-400 text-sm"
          title="This response was delayed or retried by the system"
        >
          {timeoutOccurred && <span>⏱ This response was delayed</span>}
          {retryCount > 0 && (
            <span>🔁 This agent retried {retryCount} times</span>
          )}
        </div>
      )}
      {/* Main text output from the agent */}
      <p>{text}</p>
    </div>
  );
}

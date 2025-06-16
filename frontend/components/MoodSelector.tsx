'use client';
// Component providing a reusable mood selector
// Exposes options identical to the mood tracking page so it can be reused
// across different pages such as the daily check-in
import React from 'react';

// Notes: Available mood options with friendly labels
export const MOOD_OPTIONS = [
  { label: 'Excellent 😄', value: 'Excellent' },
  { label: 'Good 🙂', value: 'Good' },
  { label: 'Neutral 😐', value: 'Neutral' },
  { label: 'Stressed 😟', value: 'Stressed' },
  { label: 'Burned Out 😫', value: 'Burned Out' },
  { label: 'Depressed 😞', value: 'Depressed' }
];

// Props expected by the component
interface MoodSelectorProps {
  // Currently selected mood value
  value: string;
  // Callback invoked when user picks a different mood
  onChange: (mood: string) => void;
}

// Notes: Render a simple <select> element with Tailwind styling
export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded w-full p-2"
    >
      {MOOD_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

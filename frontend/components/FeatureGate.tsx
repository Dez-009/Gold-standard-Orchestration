'use client';
/**
 * Wrapper that hides its children when a feature flag is disabled.
 */
import React from 'react';
import useEnabledFeatures from '../lib/useEnabledFeatures';

interface FeatureGateProps {
  name: keyof ReturnType<typeof useEnabledFeatures>;
  children: React.ReactNode;
}

export default function FeatureGate({ name, children }: FeatureGateProps) {
  // Retrieve the current feature flag map
  const flags = useEnabledFeatures();

  // Short circuit when the requested feature is not enabled
  if (!flags[name]) {
    return null;
  }

  // Render children when the feature is active
  return <>{children}</>;
}

// Footnote: Conditional rendering helper based on feature flags.

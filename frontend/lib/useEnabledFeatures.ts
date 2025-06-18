'use client';
/**
 * Hook returning the enabled feature map for the current user.
 * Components can use this to hide UI elements when a feature is disabled.
 */
import { useEffect, useState } from 'react';
import { getToken } from '../services/authUtils';
import { getEnabledFeatures } from '../services/apiClient';

export interface FeatureFlags {
  journal: boolean;
  goals: boolean;
  checkins: boolean;
  pdf_export: boolean;
  agent_feedback: boolean;
}

export default function useEnabledFeatures(): FeatureFlags {
  // Start with all features disabled until the backend responds
  const [flags, setFlags] = useState<FeatureFlags>({
    journal: false,
    goals: false,
    checkins: false,
    pdf_export: false,
    agent_feedback: false
  });

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const data = await getEnabledFeatures(token);
        const map: FeatureFlags = { ...flags };
        data.enabled_features.forEach((f: string) => {
          if (f in map) {
            (map as any)[f] = true;
          }
        });
        setFlags(map);
      } catch {
        // Ignore errors and keep defaults
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return flags;
}

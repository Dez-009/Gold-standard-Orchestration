// Central list of feature flag keys used by backend CLI and frontend UI
export const FEATURE_KEYS = [
  'journal',
  'goals',
  'pdf_export',
  'wearable_sync',
  'agent_feedback',
  'analytics',
  'checkins'
] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

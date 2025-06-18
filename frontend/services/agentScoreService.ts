// Service wrapper for retrieving agent self scoring data

import { getToken } from './authUtils';
import { getAgentSelfScores } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface SelfScoreRecord {
  id: string;
  agent_name: string;
  summary_id: string;
  user_id: number;
  self_score: number;
  reasoning?: string;
  created_at: string;
}

// Fetch self scores for a specific agent or all agents
export async function fetchSelfScores(agentName?: string) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAgentSelfScores(token, agentName);
    return data as SelfScoreRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}


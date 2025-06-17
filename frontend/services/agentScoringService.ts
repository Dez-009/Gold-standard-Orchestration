// Service wrapper for retrieving agent scoring data

import { getToken } from './authUtils';
import { getAgentScores } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface AgentScoreRecord {
  id: string;
  user_id: number;
  agent_name: string;
  completeness_score: number;
  clarity_score: number;
  relevance_score: number;
  created_at: string;
}

// Fetch agent scores applying optional filters and pagination
export async function fetchAgentScores(filters?: {
  agent_name?: string;
  user_id?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}) {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAgentScores(token, filters || {});
    return data as AgentScoreRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}



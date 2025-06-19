// Service for fetching agent execution logs

import { getToken } from './authUtils';
import { getAgentExecutionLogs } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface AgentExecutionRecord {
  id: string;
  user_id: number;
  agent_name: string;
  success: boolean;
  execution_time_ms: number;
  created_at: string;
  input_prompt: string;
  response_output: string | null;
  error_message: string | null;
}

// Notes: Fetch execution logs with optional filtering
export async function fetchAgentExecutionLogs(filters?: {
  user_id?: number;
  agent_name?: string;
  success?: boolean;
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
    const data = await getAgentExecutionLogs(token, filters || {});
    return data as AgentExecutionRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Footnote: Provides typed wrapper for agent execution log retrieval.

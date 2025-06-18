// Service wrapper for fetching agent cost totals

import { getToken } from './authUtils';
import { getAgentCostTotals } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface CostPeriod {
  period: string;
  tokens: number;
  cost: number;
}

export interface AgentCostTotals {
  total_tokens: number;
  total_cost: number;
  daily: CostPeriod[];
  weekly: CostPeriod[];
}

export async function fetchAgentCostTotals() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAgentCostTotals(token);
    return data as AgentCostTotals;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

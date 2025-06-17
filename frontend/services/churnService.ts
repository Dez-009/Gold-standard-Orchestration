// Service wrapper for fetching churn risk data

import { getToken } from './authUtils';
import { getChurnRisks } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface ChurnRiskRecord {
  id: string;
  user_id: number;
  risk_score: number;
  risk_category: string;
  calculated_at: string;
}

// Retrieve churn risk data ensuring the user is authenticated
export async function fetchChurnRisks() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getChurnRisks(token);
    return data as ChurnRiskRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

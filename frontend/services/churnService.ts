// Service wrapper for fetching churn risk data

import { getToken } from './authUtils';
import { getChurnRisks, recalculateChurnScores, getChurnScores } from './apiClient';
import { showError } from '../components/ToastProvider';

export interface ChurnRiskRecord {
  id: string;
  user_id: number;
  risk_score: number;
  risk_category: string;
  calculated_at: string;
}

// Notes: Interface representing the newer churn score entity
export interface ChurnScoreRecord {
  id: string;
  user_id: number;
  churn_risk: number;
  calculated_at: string;
  reasons?: string | null;
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

// Notes: Fetch churn scores using admin credentials
export async function fetchChurnScores() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    const data = await getChurnScores(token);
    return data as ChurnScoreRecord[];
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Notes: Trigger a backend job to recompute scores
export async function runChurnRecalculation() {
  const token = getToken();
  if (!token) {
    showError('Something went wrong');
    throw new Error('User not authenticated');
  }
  try {
    await recalculateChurnScores(token);
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

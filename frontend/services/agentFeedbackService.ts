// Wrapper around API calls related to agent feedback

import { getToken } from './authUtils';
import {
  postAgentSummaryFeedback,
  getAgentSummaryFeedback,
  AgentFeedbackPayload
} from './apiClient';
import { showError, showSuccess } from '../components/ToastProvider';

// Submit feedback for a summary using the stored JWT token
export async function submitAgentFeedback(payload: AgentFeedbackPayload) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    const data = await postAgentSummaryFeedback(token, payload);
    showSuccess('Thank you for the feedback');
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

// Fetch feedback for a summary if it exists
export async function fetchAgentFeedback(summaryId: string) {
  const token = getToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  try {
    const data = await getAgentSummaryFeedback(token, summaryId);
    return data as Record<string, unknown>;
  } catch (err) {
    showError('Something went wrong');
    throw err;
  }
}

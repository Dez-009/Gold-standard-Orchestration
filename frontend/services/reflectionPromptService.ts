// Service for retrieving reflection prompts linked to the authenticated user
// Utilizes the generic apiClient module for network requests.

import { getToken } from './authUtils';
import { getReflectionPrompts } from './apiClient';

// Type describing a reflection prompt record
export interface ReflectionPrompt {
  id: string;
  journal_id: number;
  prompt_text: string;
  created_at: string;
}

// Fetch all reflection prompts for a given user id
export async function getPromptsForUser(userId: string) {
  const token = getToken();
  if (!token) {
    // Surface an authentication failure to the calling component
    throw new Error('User not authenticated');
  }
  // Notes: Request the prompts from the backend service
  const data = await getReflectionPrompts(userId, token);
  return data as ReflectionPrompt[];
}

// Axios instance configured for the backend API
// Exports a pre-configured Axios client pointing to the backend URL
import axios from 'axios';

// Create the Axios instance with baseURL from env variable or default
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
});

// Send a prompt to the AI coach endpoint
// Includes the user's JWT token in the Authorization header
export async function postAiPrompt(prompt: string, token: string) {
  const response = await apiClient.post(
    '/vida/coach',
    { prompt },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // Return the parsed response from the backend
  return response.data;
}

export default apiClient;

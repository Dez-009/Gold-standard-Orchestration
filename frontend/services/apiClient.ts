// Axios instance configured for the backend API
// Exports a pre-configured Axios client pointing to the backend URL
import axios from 'axios';

// Create the Axios instance with baseURL from env variable or default
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
});

export default apiClient;

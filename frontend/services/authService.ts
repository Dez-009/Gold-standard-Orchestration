// Authentication service wrapping API calls
// Provides helper functions for user registration and login

import apiClient from './apiClient';

// Register a new user with the given data
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
}

// Log in a user and return the JWT token
export async function loginUser(data: { email: string; password: string }) {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
}

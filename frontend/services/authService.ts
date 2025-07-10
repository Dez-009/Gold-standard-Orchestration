// Authentication service wrapping API calls
// Provides helper functions for user registration and login

import apiClient from './apiClient';

// Register a new user with the given data
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  access_code?: string;
}) {
  const payload: any = {
    email: data.email,
    hashed_password: data.password, // Backend expects hashed_password field
    full_name: data.name,
    role: data.role || 'user', // Default to 'user' role if not specified
  };

  // Include access code if provided (for admin registration)
  if (data.access_code) {
    payload.access_code = data.access_code;
  }

  const response = await apiClient.post('/auth/register', payload);
  return response.data;
}

// Log in a user and return the JWT token
export async function loginUser(data: { email: string; password: string }) {
  const response = await apiClient.post('/auth/login', {
    username: data.email, // Backend expects username field
    password: data.password,
  });
  return response.data;
}

// Get current user details from token
export async function getCurrentUser(token: string) {
  const response = await apiClient.get('/account/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

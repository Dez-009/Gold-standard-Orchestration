// Utility functions for role-based authentication and authorization
// Provides helpers for checking user roles and redirecting appropriately

import { getToken, parseUserFromToken, isTokenExpired } from './authUtils';

export interface UserRole {
  email: string | null;
  role: string | null;
}

// Get current user role from stored token
export function getCurrentUserRole(): UserRole {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return { email: null, role: null };
  }
  
  const parsed = parseUserFromToken(token);
  return {
    email: parsed.email,
    role: parsed.role
  };
}

// Check if current user has admin role
export function isAdmin(): boolean {
  const user = getCurrentUserRole();
  return user.role === 'admin';
}

// Check if current user has user role
export function isUser(): boolean {
  const user = getCurrentUserRole();
  return user.role === 'user';
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getToken();
  return !!(token && !isTokenExpired(token));
}

// Get appropriate dashboard route based on user role
export function getDashboardRoute(role?: string | null): string {
  const userRole = role || getCurrentUserRole().role;
  
  if (userRole === 'admin') {
    return '/admin-dashboard';
  }
  return '/dashboard';
}

// Redirect to appropriate dashboard
export function redirectToDashboard(router: any, role?: string | null): void {
  const dashboardRoute = getDashboardRoute(role);
  router.push(dashboardRoute);
}

// Check if user has required role for a route
export function hasRequiredRole(requiredRole: string): boolean {
  const user = getCurrentUserRole();
  
  if (requiredRole === 'admin') {
    return user.role === 'admin';
  }
  
  if (requiredRole === 'user') {
    return user.role === 'user' || user.role === 'admin'; // Admin can access user routes
  }
  
  return false;
}

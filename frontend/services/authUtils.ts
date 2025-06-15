// Utility helpers for authentication-related logic
// Provides functions to get the JWT token and parse user information

// Retrieve JWT token from browser localStorage
export function getToken(): string | null {
  // Guard against server-side usage
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Notes: Shape of the user information inside the JWT
export interface ParsedUser {
  email: string | null;
  role: string | null;
}

// Notes: Decode JWT payload and extract email and role
export function parseUserFromToken(token: string | null): ParsedUser {
  if (!token) return { email: null, role: null };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { email: payload.email as string, role: payload.role as string };
  } catch {
    return { email: null, role: null };
  }
}

// Notes: Convenience helper to check if current user is an admin
export function isAdmin(): boolean {
  const { role } = parseUserFromToken(getToken());
  return role === 'admin';
}

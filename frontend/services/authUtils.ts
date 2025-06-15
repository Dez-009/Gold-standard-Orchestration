// Utility helpers for authentication-related logic
// Provides functions to get the JWT token and parse user information

// Retrieve JWT token from browser localStorage
export function getToken(): string | null {
  // Guard against server-side usage
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Decode JWT payload and return the user email
export function parseUserFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    // Split the token and decode the payload (second part)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email as string;
  } catch {
    // Return null if decoding fails
    return null;
  }
}

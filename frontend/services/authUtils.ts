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
  // Notes: Unix timestamp of token expiration if present
  exp: number | null;
}

// Notes: Decode JWT payload and extract email and role
export function parseUserFromToken(token: string | null): ParsedUser {
  // Notes: Return empty values when the token is missing
  if (!token) return { email: null, role: null, exp: null };
  try {
    // Notes: JWT payload is Base64URL encoded as the second segment
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Notes: Extract the standard exp claim containing expiration time
    const exp = payload.exp as number | undefined;
    return {
      email: payload.email as string,
      role: payload.role as string,
      exp: exp ?? null
    };
  } catch {
    // Notes: If parsing fails, return null fields so callers can handle it
    return { email: null, role: null, exp: null };
  }
}

// Notes: Determine whether the JWT is expired relative to current time
export function isTokenExpired(token: string | null): boolean {
  const { exp } = parseUserFromToken(token);
  if (!exp) return true;
  // Notes: JWT exp is in seconds, convert Date.now() from ms to seconds
  return exp < Date.now() / 1000;
}

// Notes: Convenience helper to check if current user is an admin
export function isAdmin(): boolean {
  const { role } = parseUserFromToken(getToken());
  return role === 'admin';
}

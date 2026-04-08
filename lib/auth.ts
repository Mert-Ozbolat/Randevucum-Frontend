export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export type UserRole = 'super_admin' | 'business_owner' | 'customer';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setAuth(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `token=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'token=; path=/; max-age=0';
}

export function isBusinessOwner(user: User | null): boolean {
  return user?.role === 'business_owner' || user?.role === 'super_admin';
}

export function isCustomer(user: User | null): boolean {
  return user?.role === 'customer';
}

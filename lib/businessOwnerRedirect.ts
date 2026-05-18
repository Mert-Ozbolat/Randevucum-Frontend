import { api } from '@/lib/api';
import { isBusinessOwner, type User } from '@/lib/auth';

export type BusinessSetupStatus = {
  hasBusiness: boolean;
  isActive: boolean;
  setupComplete: boolean;
  percent: number;
};

export async function fetchBusinessSetupStatus(): Promise<BusinessSetupStatus | null> {
  try {
    const res = await api.get<{ data: BusinessSetupStatus }>('/business/setup-status');
    return res.data.data ?? null;
  } catch {
    return null;
  }
}

/** İşletme sahibi kurulum bitmeden özet paneline gitmesin */
export function businessOwnerLandingPath(status: BusinessSetupStatus | null): string {
  if (!status?.hasBusiness || !status.setupComplete || !status.isActive) {
    return '/dashboard/business/info';
  }
  return '/dashboard/business';
}

/** Giriş / kayıt sonrası — kurulum eksikse her zaman işletme formu */
export function businessOwnerPostAuthPath(
  status: BusinessSetupStatus | null,
  from?: string | null
): string {
  const landing = businessOwnerLandingPath(status);
  if (landing === '/dashboard/business/info') return landing;
  const f = (from || '/').trim();
  if (f && f !== '/' && f !== '/login' && !f.startsWith('/register')) {
    return f;
  }
  return landing;
}

export function shouldRedirectBusinessOwner(user: User | null, pathname: string): boolean {
  if (!user || !isBusinessOwner(user)) return false;
  if (!pathname.startsWith('/dashboard/business')) return false;
  if (pathname.startsWith('/dashboard/business/info')) return false;
  return true;
}

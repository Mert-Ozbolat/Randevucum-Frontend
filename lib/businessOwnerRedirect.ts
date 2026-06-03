import { api } from '@/lib/api';
import { isBusinessOwner, type User } from '@/lib/auth';

export type BusinessSetupSteps = {
  profile: boolean;
  services: boolean;
  staff: boolean;
  hours: boolean;
};

export type BusinessSetupStatus = {
  hasBusiness: boolean;
  isActive: boolean;
  setupComplete: boolean;
  percent: number;
  steps?: BusinessSetupSteps;
};

/** Kurulum adımları — bu sayfalara serbest geçiş */
export const BUSINESS_SETUP_PATHS = [
  '/dashboard/business/info',
  '/dashboard/business/services',
  '/dashboard/business/staff',
  '/dashboard/business/working-hours',
] as const;

const STEP_HREFS: Record<keyof BusinessSetupSteps, string> = {
  profile: '/dashboard/business/info',
  services: '/dashboard/business/services',
  staff: '/dashboard/business/staff',
  hours: '/dashboard/business/working-hours',
};

export function isBusinessSetupPath(pathname: string): boolean {
  return BUSINESS_SETUP_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function allSetupStepsDone(steps?: BusinessSetupSteps | null): boolean {
  if (!steps) return false;
  return Boolean(steps.profile && steps.services && steps.staff && steps.hours);
}

/** İlk eksik kurulum adımı; hepsi tamamsa null */
export function firstIncompleteSetupPath(steps?: BusinessSetupSteps | null): string | null {
  if (!steps) return STEP_HREFS.profile;
  if (!steps.profile) return STEP_HREFS.profile;
  if (!steps.services) return STEP_HREFS.services;
  if (!steps.staff) return STEP_HREFS.staff;
  if (!steps.hours) return STEP_HREFS.hours;
  return null;
}

export function isBusinessOnboardingComplete(status: BusinessSetupStatus | null): boolean {
  if (!status?.hasBusiness) return false;
  return Boolean(status.setupComplete || allSetupStepsDone(status.steps));
}

/** Kurulum bitti ve işletme müşterilere açık — status bar gösterilmez */
export function isBusinessSetupPublished(status: BusinessSetupStatus | null): boolean {
  if (!status?.hasBusiness) return false;
  return Boolean(status.isActive && isBusinessOnboardingComplete(status));
}

export async function fetchBusinessSetupStatus(): Promise<BusinessSetupStatus | null> {
  try {
    const res = await api.get<{ data: BusinessSetupStatus }>('/business/setup-status');
    return res.data.data ?? null;
  } catch {
    return null;
  }
}

/** Giriş / dashboard kökü için hedef */
export function businessOwnerLandingPath(status: BusinessSetupStatus | null): string {
  if (!status?.hasBusiness) return STEP_HREFS.profile;
  if (isBusinessOnboardingComplete(status)) return '/dashboard/business';
  return firstIncompleteSetupPath(status.steps) ?? STEP_HREFS.profile;
}

/**
 * Giriş / kayıt sonrası: işletme formu veya eksik kurulum adımı.
 * Yalnızca dashboard dışı bir `from` (ör. /business/xxx/reserve) varsa oraya gider.
 */
export function businessOwnerPostAuthPath(
  status: BusinessSetupStatus | null,
  from?: string | null
): string {
  const f = (from || '/').trim();
  if (
    f &&
    f !== '/' &&
    f !== '/login' &&
    !f.startsWith('/register') &&
    !f.startsWith('/dashboard')
  ) {
    return f;
  }
  return businessOwnerLandingPath(status);
}

/**
 * Kurulum sürerken yalnızca işletme panelindeki “ileri” sayfalardan eksik adıma yönlendir.
 * Kurulum bitince veya kurulum sayfasındayken null döner (yönlendirme yok).
 */
export function getOnboardingRedirectTarget(
  status: BusinessSetupStatus | null,
  pathname: string
): string | null {
  if (!pathname.startsWith('/dashboard/business')) return null;
  if (isBusinessSetupPath(pathname)) return null;
  if (isBusinessOnboardingComplete(status)) return null;

  if (!status?.hasBusiness) {
    return pathname === STEP_HREFS.profile ? null : STEP_HREFS.profile;
  }

  const next = firstIncompleteSetupPath(status.steps);
  if (!next || next === pathname) return null;
  return next;
}

/** @deprecated use getOnboardingRedirectTarget */
export function shouldRedirectBusinessOwner(
  user: User | null,
  pathname: string,
  status?: BusinessSetupStatus | null
): boolean {
  if (!user || !isBusinessOwner(user)) return false;
  return getOnboardingRedirectTarget(status ?? null, pathname) !== null;
}

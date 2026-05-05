/**
 * İşletme paneli “hesap kurulumu” checklist — tamamlanma kriterleri.
 */

export type SetupStepId = 'profile' | 'services' | 'staff' | 'hours';

export type SetupStep = {
  id: SetupStepId;
  label: string;
  shortLabel: string;
  href: string;
  done: boolean;
};

export type BusinessForSetup = {
  phone?: string;
  address?: { city?: string; street?: string; district?: string };
  description?: string;
  workingHours?: { dayOfWeek?: number; open?: string; close?: string; isClosed?: boolean }[];
};

/** Kısa açıklama yeterli (uzun metin zorunluluğu kullanıcıları engelliyordu) */
const DESCRIPTION_MIN_LEN = 8;

/** Şehir veya ilçe veya anlamlı açık adres — yalnızca şehir zorunlu değil */
export function hasProfileLocationDone(b: BusinessForSetup): boolean {
  const city = b.address?.city?.trim();
  const district = b.address?.district?.trim();
  const street = b.address?.street?.trim() ?? '';
  return !!(city || district || street.length >= 5);
}

export function isProfileStepDone(b: BusinessForSetup): boolean {
  const descLen = b.description?.trim().length ?? 0;
  return !!(b.phone?.trim() && hasProfileLocationDone(b) && descLen >= DESCRIPTION_MIN_LEN);
}

export function isServicesStepDone(servicesCount: number): boolean {
  return servicesCount >= 1;
}

export function isStaffStepDone(staffCount: number): boolean {
  return staffCount >= 1;
}

export function isWorkingHoursStepDone(b: BusinessForSetup): boolean {
  const wh = b.workingHours;
  if (!wh?.length) return false;
  return wh.some((d) => !d.isClosed);
}

export function buildSetupSteps(
  business: BusinessForSetup,
  servicesCount: number,
  staffCount: number
): { steps: SetupStep[]; percent: number; completed: number; total: number } {
  const steps: SetupStep[] = [
    {
      id: 'profile',
      label: 'İşletme profili ve iletişim',
      shortLabel: 'Profil',
      href: '/dashboard/business/info',
      done: isProfileStepDone(business),
    },
    {
      id: 'services',
      label: 'En az bir hizmet',
      shortLabel: 'Hizmetler',
      href: '/dashboard/business/services',
      done: isServicesStepDone(servicesCount),
    },
    {
      id: 'staff',
      label: 'En az bir personel',
      shortLabel: 'Personel',
      href: '/dashboard/business/staff',
      done: isStaffStepDone(staffCount),
    },
    {
      id: 'hours',
      label: 'Çalışma saatleri',
      shortLabel: 'Saatler',
      href: '/dashboard/business/working-hours',
      done: isWorkingHoursStepDone(business),
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { steps, percent, completed, total };
}

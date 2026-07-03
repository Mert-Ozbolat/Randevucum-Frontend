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

export type BusinessSetupStepsMap = {
  profile: boolean;
  services: boolean;
  staff: boolean;
  hours: boolean;
};

export type BusinessForSetup = {
  phone?: string;
  address?: { city?: string; street?: string; district?: string };
  location?: { lat?: number; lng?: number };
  description?: string;
  workingHoursConfigured?: boolean;
  workingHours?: { dayOfWeek?: number; open?: string; close?: string; isClosed?: boolean }[];
};

export const DESCRIPTION_MIN_LEN = 8;

/** Şehir / açık adres veya harita pini */
export function hasProfileLocationDone(b: BusinessForSetup): boolean {
  const city = b.address?.city?.trim();
  const street = b.address?.street?.trim() ?? '';
  if (city || street.length >= 5) return true;
  const lat = b.location?.lat;
  const lng = b.location?.lng;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
  );
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
  if (!b.workingHoursConfigured) return false;
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

const SETUP_STEP_META: Omit<SetupStep, 'done'>[] = [
  {
    id: 'profile',
    label: 'İşletme profili ve iletişim',
    shortLabel: 'Profil',
    href: '/dashboard/business/info',
  },
  {
    id: 'services',
    label: 'En az bir hizmet',
    shortLabel: 'Hizmetler',
    href: '/dashboard/business/services',
  },
  {
    id: 'staff',
    label: 'En az bir personel',
    shortLabel: 'Personel',
    href: '/dashboard/business/staff',
  },
  {
    id: 'hours',
    label: 'Çalışma saatleri',
    shortLabel: 'Saatler',
    href: '/dashboard/business/working-hours',
  },
];

/** Status bar — backend /business/setup-status ile aynı sonuç */
export function buildSetupStepsFromApi(stepsMap: BusinessSetupStepsMap): {
  steps: SetupStep[];
  percent: number;
  completed: number;
  total: number;
} {
  const steps: SetupStep[] = SETUP_STEP_META.map((meta) => ({
    ...meta,
    done: Boolean(stepsMap[meta.id]),
  }));
  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { steps, percent, completed, total };
}

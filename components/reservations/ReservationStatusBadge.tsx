'use client';

import { RESERVATION_STATUS } from '@/lib/constants';

const styles: Record<string, string> = {
  pending:
    'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/80 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-800/50',
  approved:
    'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/50',
  canceled:
    'bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-600',
  completed:
    'bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200/80 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-800/50',
  no_show:
    'bg-red-50 text-red-800 ring-1 ring-inset ring-red-200/80 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-800/50',
};

export function ReservationStatusBadge({ status }: { status: string }) {
  const label = RESERVATION_STATUS[status] || status;
  const cls = styles[status] || styles.canceled;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export function reservationAccentClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-500';
    case 'approved':
      return 'bg-emerald-500';
    case 'completed':
      return 'bg-sky-500';
    case 'no_show':
      return 'bg-red-500';
    case 'canceled':
      return 'bg-neutral-300 dark:bg-neutral-600';
    default:
      return 'bg-neutral-400';
  }
}

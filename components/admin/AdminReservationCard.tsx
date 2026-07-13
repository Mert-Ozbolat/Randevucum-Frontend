'use client';

import { ReservationStatusBadge } from '@/components/reservations/ReservationStatusBadge';
import { Button } from '@/components/ui/Button';
import { canBusinessCancelReservation } from '@/lib/reservationFilters';

interface Reservation {
  _id: string;
  date: string;
  time: string;
  endTime?: string;
  status: string;
  serviceId?: { name: string; durationMinutes?: number };
  staffId?: { _id?: string; name: string; title?: string } | string | null;
  customerId?: { firstName: string; lastName: string; email?: string };
  reminders?: {
    customerRsvp?: 'confirmed' | 'canceled' | null;
    customerRsvpAt?: string | null;
  };
}

interface AdminReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  /** Takvim sütununda daha az yer kaplar */
  variant?: 'default' | 'compact';
}

function initials(first?: string, last?: string): string {
  const a = (first || '').trim().charAt(0);
  const b = (last || '').trim().charAt(0);
  const s = (a + b).toUpperCase();
  return s || '?';
}

function rsvpBadge(rsvp?: 'confirmed' | 'canceled' | null) {
  if (rsvp === 'confirmed') {
    return {
      label: 'Müşteri gelecek',
      className: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900',
    };
  }
  if (rsvp === 'canceled') {
    return {
      label: 'Müşteri iptal etti',
      className: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900',
    };
  }
  return null;
}

export function AdminReservationCard({
  reservation,
  onCancel,
  variant = 'default',
}: AdminReservationCardProps) {
  const c = reservation.customerId;
  const customerName = c ? `${c.firstName} ${c.lastName}`.trim() : '';
  const canCancel = canBusinessCancelReservation(reservation);
  const compact = variant === 'compact';
  const rsvp = rsvpBadge(reservation.reminders?.customerRsvp);

  if (compact) {
    return (
      <article className="rounded-xl border border-neutral-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary-300/60 hover:shadow-md dark:border-neutral-600 dark:bg-neutral-900/80 dark:hover:border-primary-700/50">
        <div className="flex flex-col gap-2.5 p-3 sm:flex-row sm:gap-2.5 sm:p-2.5">
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 text-[11px] font-bold text-white"
              aria-hidden
            >
              {initials(c?.firstName, c?.lastName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-bold tabular-nums text-neutral-900 dark:text-white">
                {reservation.time}
                {reservation.endTime && (
                  <span className="font-normal text-neutral-500 dark:text-neutral-400"> – {reservation.endTime}</span>
                )}
              </p>
              <p className="mt-1 break-words text-xs font-semibold leading-snug text-primary-600 dark:text-primary-400">
                {reservation.serviceId?.name || 'Hizmet'}
                {reservation.serviceId?.durationMinutes != null && (
                  <span className="font-normal text-neutral-500"> · {reservation.serviceId.durationMinutes} dk</span>
                )}
              </p>
              {customerName && (
                <p className="mt-1 break-words text-xs font-medium leading-snug text-neutral-700 dark:text-neutral-300">
                  {customerName}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-2 dark:border-neutral-700/80 sm:border-0 sm:pt-0">
            <ReservationStatusBadge status={reservation.status} />
            {canCancel && onCancel && (
              <Button
                size="sm"
                variant="danger"
                className="!px-2.5 !py-1 text-xs"
                onClick={() => onCancel(reservation._id)}
              >
                İptal et
              </Button>
            )}
          </div>
          {rsvp && (
            <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${rsvp.className}`}>
              {rsvp.label}
            </span>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-primary-200/70 hover:shadow-soft dark:border-neutral-600 dark:bg-neutral-900/70 dark:hover:border-primary-700/40">
      <div className="flex flex-col gap-3 p-4 sm:flex-row">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white shadow-sm"
          aria-hidden
        >
          {initials(c?.firstName, c?.lastName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-base font-bold tabular-nums text-neutral-900 dark:text-white">
                {reservation.time}
                {reservation.endTime && (
                  <span className="font-normal text-neutral-500 dark:text-neutral-400">
                    {' '}
                    – {reservation.endTime}
                  </span>
                )}
              </p>
              <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-primary-600 dark:text-primary-400">
                {reservation.serviceId?.name || 'Hizmet'}
              </p>
              {reservation.serviceId?.durationMinutes != null && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Süre: {reservation.serviceId.durationMinutes} dk
                </p>
              )}
            </div>
            <ReservationStatusBadge status={reservation.status} />
          </div>

          {customerName && (
            <p className="mt-2 break-words text-sm font-medium leading-snug text-neutral-800 dark:text-neutral-200">
              {customerName}
            </p>
          )}
          {c?.email && (
            <p className="mt-0.5 break-all text-xs text-neutral-500 dark:text-neutral-400">{c.email}</p>
          )}
          {rsvp && (
            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${rsvp.className}`}>
              {rsvp.label}
            </span>
          )}

          {canCancel && onCancel && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-700/80">
              <Button size="sm" variant="danger" className="rounded-lg" onClick={() => onCancel(reservation._id)}>
                Randevuyu iptal et
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

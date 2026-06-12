'use client';

import { ReservationStatusBadge } from '@/components/reservations/ReservationStatusBadge';
import { Button } from '@/components/ui/Button';
import { isActionablePending, isExpiredPending } from '@/lib/reservationFilters';

interface Reservation {
  _id: string;
  date: string;
  time: string;
  endTime?: string;
  status: string;
  serviceId?: { name: string; durationMinutes?: number };
  staffId?: { name: string };
  customerId?: { firstName: string; lastName: string; email?: string };
}

interface AdminReservationCardProps {
  reservation: Reservation;
  onApprove?: (id: string) => void;
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

export function AdminReservationCard({
  reservation,
  onApprove,
  onCancel,
  variant = 'default',
}: AdminReservationCardProps) {
  const c = reservation.customerId;
  const customerName = c ? `${c.firstName} ${c.lastName}`.trim() : '';
  const canActOnPending = isActionablePending(reservation);
  const expiredPending = isExpiredPending(reservation);
  const compact = variant === 'compact';

  if (compact) {
    return (
      <article className="rounded-xl border border-neutral-200/90 bg-white shadow-sm transition hover:border-primary-300/60 dark:border-neutral-600 dark:bg-neutral-900/80 dark:hover:border-primary-700/50">
        <div className="flex gap-2.5 p-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 text-[11px] font-bold text-white"
            aria-hidden
          >
            {initials(c?.firstName, c?.lastName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold tabular-nums text-neutral-900 dark:text-white">
                  {reservation.time}
                  {reservation.endTime && (
                    <span className="font-normal text-neutral-500 dark:text-neutral-400"> – {reservation.endTime}</span>
                  )}
                  {reservation.serviceId?.durationMinutes != null && (
                    <span className="ml-1 text-xs font-normal text-neutral-500">
                      · {reservation.serviceId.durationMinutes} dk
                    </span>
                  )}
                </p>
                <p className="truncate text-xs font-semibold text-primary-600 dark:text-primary-400">
                  {reservation.serviceId?.name || 'Hizmet'}
                </p>
                {customerName && (
                  <p className="truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">{customerName}</p>
                )}
              </div>
              <ReservationStatusBadge status={reservation.status} />
            </div>
            {expiredPending && (
              <p className="mt-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Onay süresi geçti
              </p>
            )}
            {canActOnPending && onApprove && onCancel && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Button size="sm" className="!px-2.5 !py-1 text-xs" onClick={() => onApprove(reservation._id)}>
                  Onayla
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  className="!px-2.5 !py-1 text-xs"
                  onClick={() => onCancel(reservation._id)}
                >
                  İptal
                </Button>
              </div>
            )}
            {expiredPending && onCancel && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="!px-2.5 !py-1 text-xs"
                  onClick={() => onCancel(reservation._id)}
                >
                  Kapat / İptal
                </Button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-card transition hover:border-primary-200/70 hover:shadow-soft dark:border-neutral-600 dark:bg-neutral-900/70 dark:hover:border-primary-700/40">
      <div className="flex gap-3 p-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white shadow-sm"
          aria-hidden
        >
          {initials(c?.firstName, c?.lastName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-mono text-base font-bold tabular-nums text-neutral-900 dark:text-white">
                {reservation.time}
                {reservation.endTime && (
                  <span className="font-normal text-neutral-500 dark:text-neutral-400">
                    {' '}
                    – {reservation.endTime}
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-primary-600 dark:text-primary-400">
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
            <p className="mt-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">{customerName}</p>
          )}
          {c?.email && (
            <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">{c.email}</p>
          )}

          {expiredPending && (
            <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
              Randevu saati geçti — onay verilemez. İsterseniz kaydı iptal ederek kapatabilirsiniz.
            </p>
          )}

          {canActOnPending && onApprove && onCancel && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-700/80">
              <Button size="sm" className="rounded-lg" onClick={() => onApprove(reservation._id)}>
                Onayla
              </Button>
              <Button size="sm" variant="danger" className="rounded-lg" onClick={() => onCancel(reservation._id)}>
                Reddet / İptal
              </Button>
            </div>
          )}
          {expiredPending && onCancel && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-700/80">
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => onCancel(reservation._id)}>
                Kapat / İptal
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

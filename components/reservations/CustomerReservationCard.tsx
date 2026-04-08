'use client';

import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { ReservationStatusBadge, reservationAccentClass } from './ReservationStatusBadge';

export interface CustomerReservationItem {
  _id: string;
  date: string;
  time: string;
  status: string;
  businessId?: { _id?: string; name: string; businessType?: string };
  serviceId?: { name: string; durationMinutes?: number };
}

function safeParseDate(iso: string): Date | null {
  try {
    return parseISO(iso);
  } catch {
    return null;
  }
}

export function CustomerReservationCard({
  reservation: r,
  onCancel,
}: {
  reservation: CustomerReservationItem;
  onCancel: (id: string) => void;
}) {
  const raw = typeof r.date === 'string' ? r.date : String(r.date);
  const d = safeParseDate(raw);
  const dayNum = d ? format(d, 'd') : '—';
  const monthShort = d ? format(d, 'MMM', { locale: tr }) : '';
  const weekday = d ? format(d, 'EEE', { locale: tr }) : '';
  const dateLine = d ? format(d, 'd MMMM yyyy', { locale: tr }) : raw;

  const canCancel = r.status === 'pending' || r.status === 'approved';

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-card transition duration-200 hover:border-primary-200/80 hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-900/60 dark:hover:border-primary-700/50">
      <div
        className={`absolute left-0 top-0 h-full w-1.5 ${reservationAccentClass(r.status)}`}
        aria-hidden
      />
      <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-stretch">
        <div className="flex shrink-0 gap-3 sm:flex-col sm:items-center sm:justify-center">
          <div className="flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/80 text-center dark:from-primary-950/60 dark:to-primary-900/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              {weekday}
            </span>
            <span className="text-2xl font-bold tabular-nums text-neutral-900 dark:text-white">{dayNum}</span>
            <span className="text-[11px] font-medium capitalize text-primary-700/90 dark:text-primary-300">
              {monthShort}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {r.businessId?.name || 'İşletme'}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-primary-600 dark:text-primary-400">
                {r.serviceId?.name || 'Hizmet'}
              </p>
            </div>
            <ReservationStatusBadge status={r.status} />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800" aria-hidden>
                <Clock className="h-4 w-4 text-neutral-600 dark:text-neutral-300" strokeWidth={2} />
              </span>
              <span>
                <span className="block text-xs text-neutral-500 dark:text-neutral-400">Saat</span>
                <span className="font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
                  {r.time}
                  {r.serviceId?.durationMinutes ? (
                    <span className="font-normal text-neutral-500 dark:text-neutral-400">
                      {' '}
                      · {r.serviceId.durationMinutes} dk
                    </span>
                  ) : null}
                </span>
              </span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800" aria-hidden>
                <Calendar className="h-4 w-4 text-neutral-600 dark:text-neutral-300" strokeWidth={2} />
              </span>
              <span>
                <span className="block text-xs text-neutral-500 dark:text-neutral-400">Tarih</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-100">{dateLine}</span>
              </span>
            </span>
          </div>

          {canCancel && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-700/80">
              <Button size="sm" variant="danger" onClick={() => onCancel(r._id)}>
                Randevuyu iptal et
              </Button>
              {r.businessId?._id && (
                <Link href={`/business/${r.businessId._id}`}>
                  <Button size="sm" variant="outline">
                    İşletmeyi gör
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

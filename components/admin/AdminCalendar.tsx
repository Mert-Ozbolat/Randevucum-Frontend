'use client';

import { useEffect, useState } from 'react';
import { format, startOfDay, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';
import { CalendarDays, Clock, Mail, Scissors, User, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminReservationCard } from './AdminReservationCard';
import { canBusinessCancelReservation } from '@/lib/reservationFilters';
import { ReservationStatusBadge } from '@/components/reservations/ReservationStatusBadge';

interface Reservation {
  _id: string;
  date: string;
  time: string;
  endTime?: string;
  status: string;
  serviceId?: { name: string; durationMinutes?: number };
  staffId?: { name: string };
  customerId?: { firstName: string; lastName: string; email?: string; phone?: string };
}

interface AdminCalendarProps {
  view: 'daily' | 'weekly';
  onViewChange: (view: 'daily' | 'weekly') => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  reservations: Reservation[];
  onCancel?: (id: string) => void;
}

/** Saat dilimine göre grupla (HH:mm → saat) */
function groupByHour(sorted: Reservation[]): { hourKey: string; label: string; items: Reservation[] }[] {
  const map = new Map<string, Reservation[]>();
  for (const r of sorted) {
    const t = r.time || '00:00';
    const hour = (t.split(':')[0] || '0').padStart(2, '0');
    if (!map.has(hour)) map.set(hour, []);
    map.get(hour)!.push(r);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hourKey, items]) => ({
      hourKey,
      label: `${hourKey}:00`,
      items,
    }));
}

function customerName(r: Reservation): string {
  const c = r.customerId;
  return c ? `${c.firstName} ${c.lastName}`.trim() || 'Müşteri' : 'Müşteri';
}

function reservationDayLabel(raw: string): string {
  const key = reservationLocalCalendarKey(raw);
  if (!key) return '—';
  const [year, month, day] = key.split('-').map(Number);
  return format(new Date(year, month - 1, day), 'd MMMM yyyy, EEEE', { locale: tr });
}

function ReservationClickCard({
  reservation,
  onSelect,
}: {
  reservation: Reservation;
  onSelect: (reservation: Reservation) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(reservation)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(reservation);
        }
      }}
      className="cursor-pointer rounded-xl outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary-500/40"
      aria-label={`${customerName(reservation)} randevu detayını aç`}
    >
      <AdminReservationCard variant="compact" reservation={reservation} />
    </div>
  );
}

function ReservationDetailModal({
  reservation,
  onClose,
  onCancel,
}: {
  reservation: Reservation;
  onClose: () => void;
  onCancel?: (id: string) => void;
}) {
  const c = reservation.customerId;
  const canCancel = canBusinessCancelReservation(reservation);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Randevu detayı"
    >
      <div
        className="w-full max-w-lg animate-slide-up rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900 sm:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Randevu detayı</p>
            <h3 className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
              {customerName(reservation)}
            </h3>
            <p className="mt-1 text-sm capitalize text-neutral-500 dark:text-neutral-400">
              {reservationDayLabel(String(reservation.date))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="mt-4">
          <ReservationStatusBadge status={reservation.status} />
        </div>

        <div className="mt-5 grid gap-3">
          <DetailRow
            icon={Clock}
            label="Saat"
            value={`${reservation.time}${reservation.endTime ? ` – ${reservation.endTime}` : ''}${
              reservation.serviceId?.durationMinutes ? ` (${reservation.serviceId.durationMinutes} dk)` : ''
            }`}
          />
          <DetailRow icon={Scissors} label="Hizmet" value={reservation.serviceId?.name || '—'} />
          {reservation.staffId?.name && (
            <DetailRow icon={UserRound} label="Personel" value={reservation.staffId.name} />
          )}
          <DetailRow icon={User} label="Müşteri" value={customerName(reservation)} />
          {c?.email && <DetailRow icon={Mail} label="E-posta" value={c.email} />}
          {c?.phone && <DetailRow icon={User} label="Telefon" value={c.phone} />}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" fullWidth className="sm:w-auto" onClick={onClose}>
            Kapat
          </Button>
          {canCancel && onCancel && (
            <Button
              type="button"
              variant="danger"
              fullWidth
              className="sm:w-auto"
              onClick={() => {
                onCancel(reservation._id);
                onClose();
              }}
            >
              Randevuyu iptal et
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-neutral-50 px-3 py-3 dark:bg-neutral-800/60">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {value}
        </p>
      </div>
    </div>
  );
}

export function AdminCalendar({
  view,
  onViewChange,
  selectedDate,
  onDateChange,
  reservations,
  onCancel,
}: AdminCalendarProps) {
  const todayStart = startOfDay(new Date());
  const dayStart = view === 'weekly' ? todayStart : startOfDay(selectedDate);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const days =
    view === 'weekly'
      ? Array.from({ length: 7 }, (_, i) => addDays(todayStart, i))
      : [dayStart];

  const reservationsByDay = days.map((d) => {
    const dateStr = format(d, 'yyyy-MM-dd');
    return reservations.filter((r) => {
      const raw = typeof r.date === 'string' ? r.date : String(r.date);
      const key = reservationLocalCalendarKey(raw);
      return key === dateStr;
    });
  });

  const todayStr = format(todayStart, 'yyyy-MM-dd');
  const todayCount = reservations.filter((r) => {
    const raw = typeof r.date === 'string' ? r.date : String(r.date);
    return reservationLocalCalendarKey(raw) === todayStr;
  }).length;

  /** Günlük tek sütunda daha fazla dikey alan */
  const listMaxHeightClass =
    view === 'daily'
      ? 'max-h-[min(72vh,720px)]'
      : 'max-h-[min(52vh,480px)]';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/90 bg-gradient-to-r from-white to-neutral-50/80 p-4 shadow-card dark:border-neutral-700 dark:from-neutral-900/80 dark:to-neutral-900/40 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-600 dark:bg-neutral-800">
            {(['daily', 'weekly'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  if (v === 'weekly') onDateChange(todayStart);
                  onViewChange(v);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  view === v
                    ? 'bg-primary-500 text-white shadow-sm dark:bg-primary-600'
                    : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700/50'
                }`}
              >
                {v === 'daily' ? 'Günlük' : 'Haftalık'}
              </button>
            ))}
          </div>
          {view === 'weekly' && (
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {format(todayStart, 'd MMMM', { locale: tr })} –{' '}
              {format(addDays(todayStart, 6), 'd MMMM yyyy', { locale: tr })}
              <span className="ml-1 font-normal text-neutral-500 dark:text-neutral-400">
                (bugünden itibaren 7 gün)
              </span>
            </p>
          )}
          {view === 'daily' && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onDateChange(addDays(selectedDate, -1))}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                ← Önceki gün
              </button>
              <button
                type="button"
                onClick={() => onDateChange(startOfDay(new Date()))}
                className="rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-200 dark:hover:bg-primary-900/40"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => onDateChange(addDays(selectedDate, 1))}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                Sonraki gün →
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/50">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            Bugün: {todayCount}
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 sm:text-left">
        {view === 'weekly'
          ? 'Haftalık görünüm bugünden başlayarak önümüzdeki 7 günü gösterir.'
          : 'Çok sayıda randevuda her gün kutusu içinde kaydırarak tüm listeyi görebilirsiniz; saat dilimlerine göre gruplanır.'}
      </p>

      <div
        className={`mx-auto grid w-full gap-4 sm:gap-6 ${
          view === 'daily'
            ? 'max-w-4xl grid-cols-1'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}
      >
        {days.map((d, i) => {
          const isToday = isSameDay(d, new Date());
          const dayRes = reservationsByDay[i];
          const sorted = [...dayRes].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
          const grouped = groupByHour(sorted);
          const count = dayRes.length;

          return (
            <div
              key={d.toISOString()}
              className={`flex min-h-0 flex-col rounded-2xl border p-4 shadow-card transition dark:shadow-none ${
                isToday
                  ? 'border-primary-300/80 bg-gradient-to-b from-primary-50/90 to-white dark:border-primary-700/50 dark:from-primary-950/30 dark:to-neutral-900/60'
                  : 'border-neutral-200/90 bg-neutral-50/40 dark:border-neutral-700 dark:bg-neutral-900/40'
              }`}
            >
              <div className="shrink-0 border-b border-neutral-200/80 pb-3 dark:border-neutral-700/80">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold leading-tight text-neutral-900 dark:text-white">
                    {format(d, 'd MMMM', { locale: tr })}
                    <span className="block text-xs font-medium capitalize text-neutral-500 dark:text-neutral-400">
                      {format(d, 'EEEE', { locale: tr })}
                    </span>
                  </h3>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {isToday && (
                      <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Bugün
                      </span>
                    )}
                    {count > 0 && (
                      <span className="rounded-full bg-neutral-200/90 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                        {count} randevu
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {count === 0 ? (
                <div className="mt-4 shrink-0 rounded-xl border border-dashed border-neutral-200 bg-white/60 py-10 text-center dark:border-neutral-600 dark:bg-neutral-900/30">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Bu gün randevu yok</p>
                </div>
              ) : (
                <div
                  className={`mt-3 min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth pr-1 ${listMaxHeightClass} [scrollbar-gutter:stable] [overscroll-behavior:contain]`}
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="space-y-4 pb-1">
                    {grouped.map((group) => (
                      <div key={group.hourKey}>
                        <div
                          className={`sticky top-0 z-[1] -mx-1 mb-2 flex items-center gap-2 px-1 py-1 ${
                            isToday
                              ? 'bg-primary-50/95 dark:bg-primary-950/90'
                              : 'bg-neutral-50/95 dark:bg-neutral-900/90'
                          } backdrop-blur-sm`}
                        >
                          <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-600" />
                          <span className="shrink-0 text-[11px] font-bold tabular-nums text-neutral-500 dark:text-neutral-400">
                            {group.label}
                            <span className="ml-1 font-normal text-neutral-400">({group.items.length})</span>
                          </span>
                          <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-600" />
                        </div>
                        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {group.items.map((r) => (
                            <li key={r._id}>
                              <ReservationClickCard reservation={r} onSelect={setSelectedReservation} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {count > 4 && (
                <p className="mt-2 shrink-0 text-center text-[10px] text-neutral-400 dark:text-neutral-500">
                  Liste uzunsa bu alan içinde kaydırın
                </p>
              )}
            </div>
          );
        })}
      </div>
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}

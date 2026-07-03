'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, startOfDay, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';
import { ReservationStatusBadge } from '@/components/reservations/ReservationStatusBadge';
import { Button } from '@/components/ui/Button';
import { canBusinessCancelReservation } from '@/lib/reservationFilters';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  Scissors,
  User,
  UserCircle,
  X,
} from 'lucide-react';

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

function initials(first?: string, last?: string): string {
  const a = (first || '').trim().charAt(0);
  const b = (last || '').trim().charAt(0);
  return (a + b).toUpperCase() || '?';
}

function customerName(r: Reservation): string {
  const c = r.customerId;
  return c ? `${c.firstName} ${c.lastName}`.trim() : 'Müşteri';
}

function timeToMin(t?: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function sortByTime(list: Reservation[]): Reservation[] {
  return [...list].sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
}

function groupByHour(sorted: Reservation[]): { hourKey: string; label: string; items: Reservation[] }[] {
  const map = new Map<string, Reservation[]>();
  for (const r of sorted) {
    const hour = ((r.time || '00:00').split(':')[0] || '0').padStart(2, '0');
    if (!map.has(hour)) map.set(hour, []);
    map.get(hour)!.push(r);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hourKey, items]) => ({ hourKey, label: `${hourKey}:00`, items }));
}

const STATUS_BORDER: Record<string, string> = {
  approved: 'border-l-emerald-500',
  pending: 'border-l-amber-500',
  completed: 'border-l-sky-500',
  canceled: 'border-l-neutral-300 dark:border-l-neutral-600',
};

/** Büyük, okunaklı randevu kartı — tıklanınca modal açılır */
function AppointmentCard({
  r,
  onSelect,
  size = 'default',
}: {
  r: Reservation;
  onSelect: (r: Reservation) => void;
  size?: 'default' | 'large';
}) {
  const canceled = r.status === 'canceled';
  const large = size === 'large';

  return (
    <button
      type="button"
      onClick={() => onSelect(r)}
      className={`group w-full rounded-2xl border border-l-[5px] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300/80 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:bg-neutral-900/80 dark:hover:border-primary-700/60 ${
        STATUS_BORDER[r.status] || 'border-l-neutral-300'
      } ${
        canceled
          ? 'border-neutral-200/80 opacity-60 dark:border-neutral-700'
          : 'border-neutral-200/90 dark:border-neutral-700'
      } ${large ? 'p-5' : 'p-4'}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 font-bold text-white shadow-sm ${
            large ? 'h-14 w-14 text-base' : 'h-12 w-12 text-sm'
          }`}
          aria-hidden
        >
          {initials(r.customerId?.firstName, r.customerId?.lastName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-mono font-bold tabular-nums text-neutral-900 dark:text-white ${
                large ? 'text-xl' : 'text-lg'
              }`}
            >
              {r.time}
              {r.endTime && (
                <span className="font-semibold text-neutral-400 dark:text-neutral-500"> – {r.endTime}</span>
              )}
            </span>
            {r.serviceId?.durationMinutes != null && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {r.serviceId.durationMinutes} dk
              </span>
            )}
          </div>
          <p
            className={`mt-1.5 font-semibold text-neutral-900 dark:text-neutral-50 ${
              large ? 'text-lg' : 'text-base'
            } ${canceled ? 'line-through' : ''}`}
          >
            {customerName(r)}
          </p>
          <p className={`mt-0.5 text-neutral-600 dark:text-neutral-400 ${large ? 'text-base' : 'text-sm'}`}>
            {r.serviceId?.name || 'Hizmet'}
            {r.staffId?.name && (
              <span className="text-neutral-400 dark:text-neutral-500"> · {r.staffId.name}</span>
            )}
          </p>
          <p className="mt-2 text-xs font-medium text-primary-600 opacity-0 transition group-hover:opacity-100 dark:text-primary-400">
            Detayları gör →
          </p>
        </div>
      </div>
    </button>
  );
}

/** Detay modalı */
function ReservationDetailModal({
  reservation,
  onClose,
  onCancel,
}: {
  reservation: Reservation;
  onClose: () => void;
  onCancel?: (id: string) => void;
}) {
  const canCancel = canBusinessCancelReservation(reservation);
  const c = reservation.customerId;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const dateLabel = (() => {
    const key = reservationLocalCalendarKey(String(reservation.date));
    if (!key) return '—';
    const [y, mo, d] = key.split('-').map(Number);
    return format(new Date(y, mo - 1, d), 'd MMMM yyyy, EEEE', { locale: tr });
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-detail-title"
    >
      <div
        className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-white shadow-2xl dark:bg-neutral-900 sm:animate-fade-in sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst başlık */}
        <div className="relative border-b border-neutral-200/80 px-6 pb-5 pt-6 dark:border-neutral-700">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-2 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-lg font-bold text-white shadow-md"
              aria-hidden
            >
              {initials(c?.firstName, c?.lastName)}
            </div>
            <div className="min-w-0 flex-1">
              <p id="reservation-detail-title" className="text-xl font-bold text-neutral-900 dark:text-white">
                {customerName(reservation)}
              </p>
              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{dateLabel}</p>
              <div className="mt-2">
                <ReservationStatusBadge status={reservation.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Detay satırları */}
        <div className="space-y-1 px-6 py-5">
          <DetailRow
            icon={Clock}
            label="Saat"
            value={
              <>
                <span className="font-mono text-lg font-bold tabular-nums">{reservation.time}</span>
                {reservation.endTime && (
                  <span className="font-mono text-lg font-semibold text-neutral-400">
                    {' '}
                    – {reservation.endTime}
                  </span>
                )}
                {reservation.serviceId?.durationMinutes != null && (
                  <span className="ml-2 text-sm font-normal text-neutral-500">
                    ({reservation.serviceId.durationMinutes} dakika)
                  </span>
                )}
              </>
            }
          />
          <DetailRow
            icon={Scissors}
            label="Hizmet"
            value={reservation.serviceId?.name || '—'}
          />
          {reservation.staffId?.name && (
            <DetailRow icon={UserCircle} label="Personel" value={reservation.staffId.name} />
          )}
          {c?.email && (
            <DetailRow icon={Mail} label="E-posta" value={c.email} />
          )}
          {c?.phone && (
            <DetailRow icon={User} label="Telefon" value={c.phone} />
          )}
        </div>

        {/* Alt aksiyonlar */}
        <div className="flex flex-col gap-2 border-t border-neutral-200/80 px-6 py-5 dark:border-neutral-700 sm:flex-row sm:justify-end">
          <Button variant="outline" fullWidth className="sm:w-auto sm:min-w-[7rem]" onClick={onClose}>
            Kapat
          </Button>
          {canCancel && onCancel && (
            <Button
              variant="danger"
              fullWidth
              className="sm:w-auto sm:min-w-[9rem]"
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
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl px-3 py-3.5 transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <Icon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          {label}
        </p>
        <div className="mt-0.5 text-base font-medium text-neutral-900 dark:text-neutral-100">{value}</div>
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
  const [selected, setSelected] = useState<Reservation | null>(null);

  const days = useMemo(
    () =>
      view === 'weekly'
        ? Array.from({ length: 7 }, (_, i) => addDays(todayStart, i))
        : [dayStart],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, dayStart.getTime(), todayStart.getTime()]
  );

  const reservationsByDay = useMemo(
    () =>
      days.map((d) => {
        const dateStr = format(d, 'yyyy-MM-dd');
        return sortByTime(
          reservations.filter((r) => {
            const raw = typeof r.date === 'string' ? r.date : String(r.date);
            return reservationLocalCalendarKey(raw) === dateStr;
          })
        );
      }),
    [days, reservations]
  );

  const todayStr = format(todayStart, 'yyyy-MM-dd');
  const todayCount = reservations.filter((r) => {
    const raw = typeof r.date === 'string' ? r.date : String(r.date);
    return reservationLocalCalendarKey(raw) === todayStr && r.status !== 'canceled';
  }).length;

  return (
    <div className="space-y-6">
      {/* Kontrol çubuğu */}
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-card dark:border-neutral-700 dark:bg-neutral-900/70 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-neutral-100 p-1.5 dark:bg-neutral-800">
            {(['daily', 'weekly'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  if (v === 'weekly') onDateChange(todayStart);
                  onViewChange(v);
                }}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  view === v
                    ? 'bg-white text-primary-700 shadow-sm dark:bg-neutral-900 dark:text-primary-400'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                {v === 'daily' ? 'Günlük' : 'Haftalık'}
              </button>
            ))}
          </div>

          {view === 'daily' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDateChange(addDays(selectedDate, -1))}
                className="rounded-xl border border-neutral-200 bg-white p-2.5 text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="Önceki gün"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onDateChange(startOfDay(new Date()))}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isSameDay(selectedDate, todayStart)
                    ? 'bg-primary-500 text-white shadow-sm dark:bg-primary-600'
                    : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => onDateChange(addDays(selectedDate, 1))}
                className="rounded-xl border border-neutral-200 bg-white p-2.5 text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="Sonraki gün"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          ) : (
            <p className="text-base font-medium text-neutral-700 dark:text-neutral-200">
              {format(todayStart, 'd MMMM', { locale: tr })} –{' '}
              {format(addDays(todayStart, 6), 'd MMMM yyyy', { locale: tr })}
            </p>
          )}
        </div>

        <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/50">
          <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Bugün: {todayCount} randevu
        </span>
      </div>

      {/* Günlük */}
      {view === 'daily' && (
        <DailyView
          day={days[0]}
          items={reservationsByDay[0]}
          isToday={isSameDay(days[0], new Date())}
          onSelect={setSelected}
        />
      )}

      {/* Haftalık */}
      {view === 'weekly' && (
        <WeeklyView days={days} reservationsByDay={reservationsByDay} onSelect={setSelected} />
      )}

      {selected && (
        <ReservationDetailModal
          reservation={selected}
          onClose={() => setSelected(null)}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}

function DailyView({
  day,
  items,
  isToday,
  onSelect,
}: {
  day: Date;
  items: Reservation[];
  isToday: boolean;
  onSelect: (r: Reservation) => void;
}) {
  const grouped = groupByHour(items);
  const activeCount = items.filter((r) => r.status !== 'canceled').length;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-card dark:border-neutral-700 dark:bg-neutral-900/60">
      <div
        className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5 ${
          isToday
            ? 'border-primary-200/70 bg-gradient-to-r from-primary-50/90 to-white dark:border-primary-800/50 dark:from-primary-950/40 dark:to-neutral-900/0'
            : 'border-neutral-200/80 bg-neutral-50/70 dark:border-neutral-700/80 dark:bg-neutral-900/60'
        }`}
      >
        <div className="flex items-center gap-4">
          <span
            className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl text-center ${
              isToday
                ? 'bg-primary-500 text-white shadow-md dark:bg-primary-600'
                : 'bg-white text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-600'
            }`}
          >
            <span className="text-2xl font-bold leading-none tabular-nums">{format(day, 'd')}</span>
            <span className="mt-1 text-[10px] font-bold uppercase leading-none opacity-90">
              {format(day, 'MMM', { locale: tr })}
            </span>
          </span>
          <div>
            <p className="text-xl font-bold capitalize text-neutral-900 dark:text-neutral-50">
              {format(day, 'EEEE', { locale: tr })}
              {isToday && (
                <span className="ml-2 rounded-full bg-primary-500 px-2.5 py-0.5 align-middle text-xs font-bold uppercase tracking-wide text-white">
                  Bugün
                </span>
              )}
            </p>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              {format(day, 'd MMMM yyyy', { locale: tr })}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-600">
          <Clock className="h-4 w-4 text-primary-500" strokeWidth={2} aria-hidden />
          {activeCount} aktif randevu
        </span>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <CalendarDays className="h-8 w-8 text-neutral-400" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-5 text-base font-medium text-neutral-600 dark:text-neutral-300">
            Bu gün için randevu yok
          </p>
        </div>
      ) : (
        <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
          {grouped.map((group) => (
            <section key={group.hourKey}>
              <h3 className="mb-4 flex items-center gap-3 text-base font-bold text-neutral-700 dark:text-neutral-200">
                <span className="font-mono tabular-nums">{group.label}</span>
                <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                <span className="text-sm font-medium text-neutral-400">
                  {group.items.length} randevu
                </span>
              </h3>
              <div className="space-y-4">
                {group.items.map((r) => (
                  <AppointmentCard key={r._id} r={r} onSelect={onSelect} size="large" />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function WeeklyView({
  days,
  reservationsByDay,
  onSelect,
}: {
  days: Date[];
  reservationsByDay: Reservation[][];
  onSelect: (r: Reservation) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {days.map((d, i) => {
        const isToday = isSameDay(d, new Date());
        const items = reservationsByDay[i];
        const activeCount = items.filter((r) => r.status !== 'canceled').length;

        return (
          <section
            key={d.toISOString()}
            className={`overflow-hidden rounded-2xl border shadow-card dark:shadow-none ${
              isToday
                ? 'border-primary-300/80 ring-2 ring-primary-200/50 dark:border-primary-700/60 dark:ring-primary-900/40'
                : 'border-neutral-200/90 dark:border-neutral-700'
            }`}
          >
            <header
              className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
                isToday
                  ? 'border-primary-200/70 bg-primary-50/80 dark:border-primary-800/50 dark:bg-primary-950/40'
                  : 'border-neutral-200/70 bg-neutral-50/80 dark:border-neutral-700/70 dark:bg-neutral-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold tabular-nums ${
                    isToday
                      ? 'bg-primary-500 text-white dark:bg-primary-600'
                      : 'bg-white text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-600'
                  }`}
                >
                  {format(d, 'd')}
                </span>
                <div>
                  <p className="text-base font-bold capitalize text-neutral-900 dark:text-neutral-50">
                    {format(d, 'EEEE', { locale: tr })}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {format(d, 'MMMM yyyy', { locale: tr })}
                  </p>
                </div>
              </div>
              {activeCount > 0 && (
                <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-bold tabular-nums text-primary-800 dark:bg-primary-900/60 dark:text-primary-200">
                  {activeCount}
                </span>
              )}
            </header>

            <div className="space-y-3 bg-white p-4 dark:bg-neutral-900/50">
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  Randevu yok
                </p>
              ) : (
                items.map((r) => <AppointmentCard key={r._id} r={r} onSelect={onSelect} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

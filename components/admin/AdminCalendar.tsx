'use client';

import { useMemo, useState } from 'react';
import { format, startOfDay, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Scissors,
  User,
  X,
} from 'lucide-react';
import { AdminReservationCard } from './AdminReservationCard';

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

/** Saat başlıklarına göre grupla */
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

const STATUS_ACCENT: Record<string, string> = {
  approved: 'border-l-emerald-400 dark:border-l-emerald-500',
  pending: 'border-l-amber-400 dark:border-l-amber-500',
  completed: 'border-l-sky-400 dark:border-l-sky-500',
  canceled: 'border-l-neutral-300 dark:border-l-neutral-600',
};

const STATUS_DOT: Record<string, string> = {
  approved: 'bg-emerald-500',
  pending: 'bg-amber-500',
  completed: 'bg-sky-500',
  canceled: 'bg-neutral-400',
};

/** Haftalık görünümdeki kompakt randevu çipi */
function WeekChip({ r, onSelect }: { r: Reservation; onSelect: (r: Reservation) => void }) {
  const canceled = r.status === 'canceled';
  return (
    <button
      type="button"
      onClick={() => onSelect(r)}
      className={`group flex w-full items-center gap-2 rounded-lg border border-l-[3px] px-2 py-1.5 text-left transition hover:shadow-sm ${
        STATUS_ACCENT[r.status] || 'border-l-neutral-300'
      } ${
        canceled
          ? 'border-neutral-200/70 bg-neutral-50 opacity-55 dark:border-neutral-700 dark:bg-neutral-900/40'
          : 'border-neutral-200/80 bg-white hover:border-primary-300/70 dark:border-neutral-700 dark:bg-neutral-900/70 dark:hover:border-primary-700/60'
      }`}
    >
      <span className="shrink-0 font-mono text-[11px] font-bold tabular-nums text-neutral-800 dark:text-neutral-100">
        {r.time}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[11px] font-semibold ${canceled ? 'line-through' : ''} text-neutral-800 dark:text-neutral-100`}>
          {customerName(r)}
        </span>
        <span className="block truncate text-[10px] text-neutral-500 dark:text-neutral-400">
          {r.serviceId?.name || 'Hizmet'}
        </span>
      </span>
    </button>
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
    <div className="space-y-5">
      {/* Kontrol çubuğu */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3 shadow-card dark:border-neutral-700 dark:bg-neutral-900/70 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
            {(['daily', 'weekly'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  if (v === 'weekly') onDateChange(todayStart);
                  onViewChange(v);
                }}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
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
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onDateChange(addDays(selectedDate, -1))}
                className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="Önceki gün"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onDateChange(startOfDay(new Date()))}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  isSameDay(selectedDate, todayStart)
                    ? 'bg-primary-500 text-white shadow-sm dark:bg-primary-600'
                    : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => onDateChange(addDays(selectedDate, 1))}
                className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="Sonraki gün"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : (
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {format(todayStart, 'd MMM', { locale: tr })} –{' '}
              {format(addDays(todayStart, 6), 'd MMM yyyy', { locale: tr })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 md:flex">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Onaylı
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-400" /> İptal
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/50">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            Bugün: {todayCount}
          </span>
        </div>
      </div>

      {/* ——— GÜNLÜK: zaman çizelgesi ——— */}
      {view === 'daily' && (
        <DailyTimeline
          day={days[0]}
          items={reservationsByDay[0]}
          isToday={isSameDay(days[0], new Date())}
          onCancel={onCancel}
        />
      )}

      {/* ——— HAFTALIK: 7 gün ızgara ——— */}
      {view === 'weekly' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {days.map((d, i) => {
            const isToday = isSameDay(d, new Date());
            const items = reservationsByDay[i];
            const activeCount = items.filter((r) => r.status !== 'canceled').length;

            return (
              <div
                key={d.toISOString()}
                className={`flex min-h-[10rem] flex-col overflow-hidden rounded-2xl border shadow-card transition dark:shadow-none ${
                  isToday
                    ? 'border-primary-300/80 ring-1 ring-primary-200/60 dark:border-primary-700/60 dark:ring-primary-900/40'
                    : 'border-neutral-200/90 dark:border-neutral-700'
                }`}
              >
                <div
                  className={`flex items-center justify-between gap-2 border-b px-3 py-2.5 ${
                    isToday
                      ? 'border-primary-200/70 bg-primary-50/80 dark:border-primary-800/50 dark:bg-primary-950/40'
                      : 'border-neutral-200/70 bg-neutral-50/80 dark:border-neutral-700/70 dark:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${
                        isToday
                          ? 'bg-primary-500 text-white dark:bg-primary-600'
                          : 'bg-white text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-600'
                      }`}
                    >
                      {format(d, 'd')}
                    </span>
                    <span className="text-xs font-semibold capitalize leading-tight text-neutral-700 dark:text-neutral-200">
                      {format(d, 'EEEE', { locale: tr })}
                      <span className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                        {format(d, 'MMMM', { locale: tr })}
                      </span>
                    </span>
                  </div>
                  {activeCount > 0 && (
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-primary-800 dark:bg-primary-900/60 dark:text-primary-200">
                      {activeCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 bg-white p-2 dark:bg-neutral-900/50">
                  {items.length === 0 ? (
                    <p className="flex h-full min-h-[4rem] items-center justify-center text-[11px] text-neutral-400 dark:text-neutral-500">
                      Randevu yok
                    </p>
                  ) : (
                    <div className="max-h-72 space-y-1.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                      {items.map((r) => (
                        <WeekChip key={r._id} r={r} onSelect={setSelected} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Haftalık çip detayı */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md animate-slide-up rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900 sm:animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                {format(new Date(selected.date), 'd MMMM yyyy, EEEE', { locale: tr })}
              </p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <AdminReservationCard
              reservation={selected}
              onCancel={
                onCancel
                  ? (id) => {
                      onCancel(id);
                      setSelected(null);
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Günlük görünüm: saat rayı + kartlar */
function DailyTimeline({
  day,
  items,
  isToday,
  onCancel,
}: {
  day: Date;
  items: Reservation[];
  isToday: boolean;
  onCancel?: (id: string) => void;
}) {
  const grouped = groupByHour(items);
  const activeCount = items.filter((r) => r.status !== 'canceled').length;
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-card dark:border-neutral-700 dark:bg-neutral-900/60">
      {/* Gün başlığı */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${
          isToday
            ? 'border-primary-200/70 bg-gradient-to-r from-primary-50/90 to-white dark:border-primary-800/50 dark:from-primary-950/40 dark:to-neutral-900/0'
            : 'border-neutral-200/80 bg-neutral-50/70 dark:border-neutral-700/80 dark:bg-neutral-900/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-center ${
              isToday
                ? 'bg-primary-500 text-white shadow-sm dark:bg-primary-600'
                : 'bg-white text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-600'
            }`}
          >
            <span className="text-lg font-bold leading-none tabular-nums">{format(day, 'd')}</span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase leading-none opacity-90">
              {format(day, 'MMM', { locale: tr })}
            </span>
          </span>
          <div>
            <p className="text-base font-bold capitalize text-neutral-900 dark:text-neutral-50">
              {format(day, 'EEEE', { locale: tr })}
              {isToday && (
                <span className="ml-2 rounded-full bg-primary-500 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white">
                  Bugün
                </span>
              )}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {format(day, 'd MMMM yyyy', { locale: tr })}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-600">
          <Clock className="h-3.5 w-3.5 text-primary-500" strokeWidth={2} aria-hidden />
          {activeCount} aktif randevu
        </span>
      </div>

      {/* Zaman çizelgesi */}
      {items.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <CalendarDays className="h-7 w-7 text-neutral-400" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            Bu gün için randevu yok
          </p>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            Yeni randevular geldiğinde burada görünür.
          </p>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto px-4 py-5 sm:px-6 [scrollbar-gutter:stable]">
          <ol className="relative space-y-6 before:absolute before:bottom-2 before:left-[3.05rem] before:top-2 before:w-px before:bg-gradient-to-b before:from-primary-200 before:via-neutral-200 before:to-neutral-100 dark:before:from-primary-800/60 dark:before:via-neutral-700 dark:before:to-neutral-800 sm:before:left-[3.3rem]">
            {grouped.map((group) => {
              const hourMin = Number(group.hourKey) * 60;
              const hourPassed = isToday && nowMinutes >= hourMin + 60;
              return (
                <li key={group.hourKey} className="relative">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Saat rayı */}
                    <div className="flex w-10 shrink-0 flex-col items-end pt-0.5 sm:w-11">
                      <span
                        className={`font-mono text-xs font-bold tabular-nums ${
                          hourPassed
                            ? 'text-neutral-400 dark:text-neutral-500'
                            : 'text-neutral-700 dark:text-neutral-200'
                        }`}
                      >
                        {group.label}
                      </span>
                    </div>

                    {/* Nokta */}
                    <div className="relative flex w-2 shrink-0 justify-center">
                      <span
                        className={`absolute top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-neutral-900 ${
                          hourPassed ? 'bg-neutral-300 dark:bg-neutral-600' : 'bg-primary-500'
                        }`}
                      />
                    </div>

                    {/* Randevular */}
                    <div className="min-w-0 flex-1 space-y-2.5 pb-1">
                      {group.items.map((r) => {
                        const canceled = r.status === 'canceled';
                        const past = isToday && timeToMin(r.endTime || r.time) < nowMinutes;
                        return (
                          <article
                            key={r._id}
                            className={`rounded-xl border border-l-4 bg-white shadow-sm transition hover:shadow-md dark:bg-neutral-900/80 ${
                              STATUS_ACCENT[r.status] || 'border-l-neutral-300'
                            } ${
                              canceled || past
                                ? 'border-neutral-200/70 opacity-55 dark:border-neutral-700'
                                : 'border-neutral-200/90 hover:border-primary-200 dark:border-neutral-700 dark:hover:border-primary-800/60'
                            }`}
                          >
                            <div className="flex items-start gap-3 p-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white"
                                aria-hidden
                              >
                                {initials(r.customerId?.firstName, r.customerId?.lastName)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span className="font-mono text-sm font-bold tabular-nums text-neutral-900 dark:text-white">
                                    {r.time}
                                    {r.endTime && (
                                      <span className="font-normal text-neutral-400"> – {r.endTime}</span>
                                    )}
                                  </span>
                                  {r.serviceId?.durationMinutes != null && (
                                    <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                      {r.serviceId.durationMinutes} dk
                                    </span>
                                  )}
                                  <span
                                    className={`ml-auto inline-flex h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[r.status] || 'bg-neutral-400'}`}
                                    title={r.status}
                                  />
                                </div>
                                <p className={`mt-0.5 flex items-center gap-1.5 truncate text-sm font-semibold ${canceled ? 'line-through' : ''} text-neutral-800 dark:text-neutral-100`}>
                                  <User className="h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
                                  {customerName(r)}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                                  <Scissors className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                                  {r.serviceId?.name || 'Hizmet'}
                                  {r.staffId?.name && (
                                    <span className="truncate text-neutral-400">· {r.staffId.name}</span>
                                  )}
                                </p>
                              </div>
                              {!canceled && onCancel && (
                                <button
                                  type="button"
                                  onClick={() => onCancel(r._id)}
                                  className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                >
                                  İptal
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

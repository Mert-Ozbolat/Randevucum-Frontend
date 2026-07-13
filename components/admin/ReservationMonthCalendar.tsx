'use client';

import { useMemo } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';

interface ReservationMonthCalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  reservations: { date: string; status?: string }[];
}

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function countByDay(reservations: { date: string; status?: string }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of reservations) {
    if (r.status === 'canceled') continue;
    const raw = typeof r.date === 'string' ? r.date : String(r.date);
    const key = reservationLocalCalendarKey(raw);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

export function ReservationMonthCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  reservations,
}: ReservationMonthCalendarProps) {
  const counts = useMemo(() => countByDay(reservations), [reservations]);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const today = startOfDay(new Date());

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(monthStart, 1))}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          aria-label="Önceki ay"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <p className="text-center text-sm font-bold capitalize text-neutral-900 dark:text-white sm:text-base">
          {format(monthStart, 'MMMM yyyy', { locale: tr })}
        </p>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(monthStart, 1))}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          aria-label="Sonraki ay"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500 sm:text-xs"
          >
            {label}
          </div>
        ))}

        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          const count = counts.get(key) || 0;
          const inMonth = isSameMonth(d, monthStart);
          const isSelected = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, today);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(startOfDay(d))}
              className={`relative flex min-h-[2.75rem] flex-col items-center justify-center rounded-xl border py-1.5 text-center transition sm:min-h-[3.25rem] ${
                isSelected
                  ? 'border-primary-500 bg-primary-500 text-white shadow-sm dark:border-primary-500 dark:bg-primary-600'
                  : isToday
                    ? 'border-primary-300 bg-primary-50 text-primary-800 ring-2 ring-primary-400/30 dark:border-primary-700 dark:bg-primary-950/40 dark:text-primary-200'
                    : inMonth
                      ? 'border-neutral-200/80 bg-white text-neutral-800 hover:border-primary-300 hover:bg-primary-50/60 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100 dark:hover:border-primary-700'
                      : 'border-transparent bg-neutral-50/80 text-neutral-400 hover:bg-neutral-100 dark:bg-neutral-900/30 dark:text-neutral-600'
              }`}
              aria-label={`${format(d, 'd MMMM yyyy', { locale: tr })}${count ? `, ${count} randevu` : ''}`}
              aria-pressed={isSelected}
            >
              <span className={`text-sm font-semibold tabular-nums sm:text-base ${!inMonth ? 'opacity-60' : ''}`}>
                {format(d, 'd')}
              </span>
              {count > 0 && (
                <span
                  className={`mt-0.5 inline-flex min-w-[1.125rem] items-center justify-center rounded-full px-1 text-[9px] font-bold tabular-nums sm:text-[10px] ${
                    isSelected
                      ? 'bg-white/25 text-white'
                      : 'bg-primary-500 text-white dark:bg-primary-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

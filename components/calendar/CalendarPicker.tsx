'use client';

import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  daysCount?: number;
  /** yyyy-MM-dd — bu günler seçilemez */
  disabledDateKeys?: Set<string> | string[];
}

function toKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
  daysCount = 14,
  disabledDateKeys,
}: CalendarPickerProps) {
  const dates = Array.from({ length: daysCount }, (_, i) => addDays(startOfDay(minDate), i));
  const disabledSet =
    disabledDateKeys instanceof Set
      ? disabledDateKeys
      : new Set(disabledDateKeys || []);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tarih seçin</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {dates.map((d) => {
          const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
          const isDisabled = disabledSet.has(toKey(d));
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectDate(d)}
              className={`rounded-xl border py-3 text-center text-sm font-medium transition-all duration-200 ${
                isDisabled
                  ? 'cursor-not-allowed border-neutral-100 bg-neutral-100 text-neutral-400 opacity-60 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-500'
                  : isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-soft ring-2 ring-primary-500/20 dark:bg-primary-950/40 dark:text-primary-300'
                    : 'border-neutral-200 bg-white text-neutral-700 shadow-card hover:border-primary-300 hover:bg-primary-50/50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200'
              }`}
            >
              <span className="block">{format(d, 'd')}</span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                {format(d, 'EEE', { locale: tr })}
              </span>
              <span className="block text-xs text-neutral-400 dark:text-neutral-500">
                {format(d, 'MMM', { locale: tr })}
              </span>
              {isDisabled && <span className="mt-1 block text-[10px] font-semibold uppercase">Kapalı</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

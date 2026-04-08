'use client';

import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  daysCount?: number;
}

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
  daysCount = 14,
}: CalendarPickerProps) {
  const dates = Array.from({ length: daysCount }, (_, i) => addDays(startOfDay(minDate), i));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-700">Tarih seçin</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {dates.map((d) => {
          const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelectDate(d)}
              className={`rounded-xl border py-3 text-center text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-soft ring-2 ring-primary-500/20'
                  : 'border-neutral-200 bg-white text-neutral-700 shadow-card hover:border-primary-300 hover:bg-primary-50/50'
              }`}
            >
              <span className="block">{format(d, 'd')}</span>
              <span className="block text-xs text-neutral-500">
                {format(d, 'EEE', { locale: tr })}
              </span>
              <span className="block text-xs text-neutral-400">
                {format(d, 'MMM', { locale: tr })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

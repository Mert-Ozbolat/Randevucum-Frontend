'use client';

import { format } from 'date-fns';

export type SlotStatus = 'available' | 'full' | 'past';

export interface SlotOption {
  time: string;
  status: SlotStatus;
  label?: string; // For business owner: customer name when full
}

interface TimeSlotGridProps {
  slots: SlotOption[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  loading?: boolean;
  isBusinessOwner?: boolean;
}

export function TimeSlotGrid({
  slots,
  selectedTime,
  onSelectTime,
  loading = false,
  isBusinessOwner = false,
}: TimeSlotGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-xl bg-neutral-100"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-8 text-center text-sm text-neutral-500">
        Bu tarihte müsait saat bulunmuyor.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-700">Saat seçin</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {slots.map((slot) => {
          const isAvailable = slot.status === 'available';
          const isPast = slot.status === 'past';
          const isSelected = selectedTime === slot.time;
          const disabled = !isAvailable || isPast;

          return (
            <button
              key={slot.time}
              type="button"
              disabled={disabled}
              onClick={() => isAvailable && onSelectTime(slot.time)}
              className={`relative rounded-xl border py-2.5 text-center text-sm font-medium transition-all duration-200 ${
                disabled
                  ? isPast
                    ? 'cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-400'
                    : 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-500'
                  : isSelected
                  ? 'border-primary-500 bg-primary-500 text-white shadow-glow ring-2 ring-primary-500/30'
                  : 'border-primary-200 bg-primary-50 text-primary-800 shadow-card hover:border-primary-400 hover:bg-primary-100'
              }`}
            >
              {slot.status === 'full' && !isBusinessOwner && (
                <span className="block">Dolu</span>
              )}
              {slot.status === 'full' && isBusinessOwner && slot.label && (
                <>
                  <span className="block text-neutral-500">{slot.time}</span>
                  <span className="mt-0.5 block truncate text-xs font-medium text-neutral-700">
                    {slot.label}
                  </span>
                </>
              )}
              {(slot.status === 'available' || slot.status === 'past') && (
                <span>{slot.time}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

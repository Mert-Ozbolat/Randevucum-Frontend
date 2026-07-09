'use client';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AdminReservationCard } from './AdminReservationCard';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';
import type { BusinessReservation } from '@/contexts/BusinessReservationsLiveContext';

import {
  groupReservations,
  sortReservations,
  type ListGroupMode,
  type ReservationSortMode,
} from '@/lib/reservationSort';

type GroupedReservation = BusinessReservation;

interface ReservationGroupedListProps {
  reservations: GroupedReservation[];
  sortMode: ReservationSortMode;
  groupMode: ListGroupMode;
  onCancel?: (id: string) => void;
  onSelect?: (reservation: GroupedReservation) => void;
  dimPast?: boolean;
}

function formatGroupDayLabel(key: string): string {
  if (!key || key === 'unknown') return 'Tarih bilinmiyor';
  const [y, mo, d] = key.split('-').map(Number);
  if (!y || !mo || !d) return key;
  return format(new Date(y, mo - 1, d), 'd MMMM yyyy, EEEE', { locale: tr });
}

function formatReservationMeta(r: GroupedReservation): string {
  const key = reservationLocalCalendarKey(String(r.date));
  const day = key ? formatGroupDayLabel(key) : '—';
  const time = `${r.time}${r.endTime ? ` – ${r.endTime}` : ''}`;
  return `${day} · ${time}`;
}

export function ReservationGroupedList({
  reservations,
  sortMode,
  groupMode,
  onCancel,
  onSelect,
  dimPast = false,
}: ReservationGroupedListProps) {
  const sorted = sortReservations(reservations, sortMode);
  const groups = groupReservations(sorted, groupMode);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key}>
          {groupMode !== 'flat' && group.label && (
            <h3 className="mb-3 text-sm font-bold text-neutral-800 dark:text-neutral-100">
              {groupMode === 'by_day' ? formatGroupDayLabel(group.label) : group.label}
              <span className="ml-2 font-normal text-neutral-400">({group.items.length})</span>
            </h3>
          )}
          <ul className="space-y-3">
            {group.items.map((r) => (
              <li
                key={r._id}
                className={dimPast ? 'rounded-2xl opacity-75' : ''}
              >
                {groupMode === 'flat' && (
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <span>{formatReservationMeta(r)}</span>
                    {typeof r.staffId === 'object' && r.staffId?.name && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800">
                        {r.staffId.name}
                      </span>
                    )}
                  </div>
                )}
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(r)}
                    className="w-full cursor-pointer rounded-xl text-left outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary-500/40"
                  >
                    <AdminReservationCard reservation={r} onCancel={onCancel} />
                  </button>
                ) : (
                  <AdminReservationCard reservation={r} onCancel={onCancel} />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

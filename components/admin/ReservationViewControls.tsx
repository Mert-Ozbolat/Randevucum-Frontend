'use client';

import { ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import {
  CALENDAR_LAYOUT_LABELS,
  LIST_GROUP_LABELS,
  SORT_MODE_LABELS,
  type CalendarLayoutMode,
  type ListGroupMode,
  type ReservationSortMode,
} from '@/lib/reservationSort';

interface ReservationViewControlsProps {
  sortMode: ReservationSortMode;
  onSortModeChange: (mode: ReservationSortMode) => void;
  /** Takvim sekmesinde görünüm düzeni */
  calendarLayout?: CalendarLayoutMode;
  onCalendarLayoutChange?: (layout: CalendarLayoutMode) => void;
  /** Liste sekmelerinde gruplama */
  listGroup?: ListGroupMode;
  onListGroupChange?: (group: ListGroupMode) => void;
  showCalendarLayout?: boolean;
  showListGroup?: boolean;
}

function SelectChip({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  icon: typeof ArrowUpDown;
}) {
  return (
    <div className="min-w-0 flex-1 sm:min-w-[200px]">
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 shadow-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ReservationViewControls({
  sortMode,
  onSortModeChange,
  calendarLayout,
  onCalendarLayoutChange,
  listGroup,
  onListGroupChange,
  showCalendarLayout = false,
  showListGroup = false,
}: ReservationViewControlsProps) {
  const sortOptions = (Object.entries(SORT_MODE_LABELS) as [ReservationSortMode, string][]).map(
    ([value, label]) => ({ value, label })
  );

  const layoutOptions = (Object.entries(CALENDAR_LAYOUT_LABELS) as [CalendarLayoutMode, string][]).map(
    ([value, label]) => ({ value, label })
  );

  const groupOptions = (Object.entries(LIST_GROUP_LABELS) as [ListGroupMode, string][]).map(
    ([value, label]) => ({ value, label })
  );

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-card dark:border-neutral-700 dark:bg-neutral-900/60">
      <p className="mb-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        Görünüm ve sıralama
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <SelectChip
          label="Sıralama"
          value={sortMode}
          options={sortOptions}
          onChange={(v) => onSortModeChange(v as ReservationSortMode)}
          icon={ArrowUpDown}
        />
        {showCalendarLayout && calendarLayout && onCalendarLayoutChange && (
          <SelectChip
            label="Takvim düzeni"
            value={calendarLayout}
            options={layoutOptions}
            onChange={(v) => onCalendarLayoutChange(v as CalendarLayoutMode)}
            icon={LayoutGrid}
          />
        )}
        {showListGroup && listGroup !== undefined && onListGroupChange && (
          <SelectChip
            label="Gruplama"
            value={listGroup}
            options={groupOptions}
            onChange={(v) => onListGroupChange(v as ListGroupMode)}
            icon={List}
          />
        )}
      </div>
    </div>
  );
}

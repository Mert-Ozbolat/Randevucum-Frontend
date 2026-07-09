import type { CalendarLayoutMode, ListGroupMode, ReservationSortMode } from './reservationSort';

export interface ReservationViewPrefs {
  sortMode: ReservationSortMode;
  calendarLayout: CalendarLayoutMode;
  listGroup: ListGroupMode;
}

const STORAGE_PREFIX = 'business-reservation-prefs';

export const DEFAULT_VIEW_PREFS: ReservationViewPrefs = {
  sortMode: 'time_asc',
  calendarLayout: 'timeline',
  listGroup: 'flat',
};

function storageKey(businessId: string): string {
  return `${STORAGE_PREFIX}-${businessId}`;
}

export function loadReservationViewPrefs(businessId: string | null): ReservationViewPrefs {
  if (!businessId || typeof window === 'undefined') return { ...DEFAULT_VIEW_PREFS };
  try {
    const raw = localStorage.getItem(storageKey(businessId));
    if (!raw) return { ...DEFAULT_VIEW_PREFS };
    const parsed = JSON.parse(raw) as Partial<ReservationViewPrefs>;
    return { ...DEFAULT_VIEW_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_VIEW_PREFS };
  }
}

export function saveReservationViewPrefs(businessId: string, prefs: ReservationViewPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(businessId), JSON.stringify(prefs));
  } catch {
    // ignore quota errors
  }
}

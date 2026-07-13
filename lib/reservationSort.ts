import { reservationLocalCalendarKey } from './reservationDate';
import { reservationEndAt, reservationStartAt, type ReservationLike } from './reservationFilters';

export type ReservationSortMode =
  | 'time_asc'
  | 'time_desc'
  | 'customer_asc'
  | 'customer_desc'
  | 'staff_asc'
  | 'service_asc'
  | 'status';

export type CalendarLayoutMode = 'timeline' | 'hour_grid' | 'by_staff' | 'by_service' | 'compact' | 'calendar';

export type ListGroupMode = 'flat' | 'by_day' | 'by_staff' | 'by_service';

export type SortableReservation = ReservationLike & {
  customerId?: { firstName?: string; lastName?: string };
  staffId?: { name?: string; title?: string } | string | null;
  serviceId?: { name?: string };
};

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  approved: 1,
  completed: 2,
  no_show: 3,
  canceled: 4,
};

export const SORT_MODE_LABELS: Record<ReservationSortMode, string> = {
  time_asc: 'Saate göre (erken → geç)',
  time_desc: 'Saate göre (geç → erken)',
  customer_asc: 'Müşteri (A → Z)',
  customer_desc: 'Müşteri (Z → A)',
  staff_asc: 'Personel (A → Z)',
  service_asc: 'Hizmet (A → Z)',
  status: 'Duruma göre',
};

export const CALENDAR_LAYOUT_LABELS: Record<CalendarLayoutMode, string> = {
  timeline: 'Zaman çizelgesi',
  calendar: 'Takvim',
  hour_grid: 'Saat kutuları',
  by_staff: 'Personele göre',
  by_service: 'Hizmete göre',
  compact: 'Kompakt liste',
};

export const LIST_GROUP_LABELS: Record<ListGroupMode, string> = {
  flat: 'Düz liste',
  by_day: 'Güne göre',
  by_staff: 'Personele göre',
  by_service: 'Hizmete göre',
};

function customerName(r: SortableReservation): string {
  const c = r.customerId;
  return c ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : '';
}

function staffLabel(r: SortableReservation): string {
  const s = r.staffId;
  if (!s) return 'Atanmamış';
  if (typeof s === 'string') return 'Atanmamış';
  return s.name || 'Atanmamış';
}

function serviceLabel(r: SortableReservation): string {
  return r.serviceId?.name || 'Hizmet';
}

function dayKey(r: SortableReservation): string {
  const raw = typeof r.date === 'string' ? r.date : String(r.date);
  return reservationLocalCalendarKey(raw) || '';
}

export function sortReservations<T extends SortableReservation>(list: T[], mode: ReservationSortMode): T[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    switch (mode) {
      case 'time_asc': {
        const ea = reservationStartAt(a)?.getTime() ?? 0;
        const eb = reservationStartAt(b)?.getTime() ?? 0;
        return ea - eb;
      }
      case 'time_desc': {
        const ea = reservationStartAt(a)?.getTime() ?? 0;
        const eb = reservationStartAt(b)?.getTime() ?? 0;
        return eb - ea;
      }
      case 'customer_asc':
        return customerName(a).localeCompare(customerName(b), 'tr');
      case 'customer_desc':
        return customerName(b).localeCompare(customerName(a), 'tr');
      case 'staff_asc':
        return staffLabel(a).localeCompare(staffLabel(b), 'tr');
      case 'service_asc':
        return serviceLabel(a).localeCompare(serviceLabel(b), 'tr');
      case 'status': {
        const sa = STATUS_ORDER[a.status] ?? 99;
        const sb = STATUS_ORDER[b.status] ?? 99;
        if (sa !== sb) return sa - sb;
        const ea = reservationEndAt(a)?.getTime() ?? 0;
        const eb = reservationEndAt(b)?.getTime() ?? 0;
        return eb - ea;
      }
      default:
        return 0;
    }
  });
  return sorted;
}

export interface ReservationGroup<T extends SortableReservation> {
  key: string;
  label: string;
  items: T[];
}

export function groupReservations<T extends SortableReservation>(
  list: T[],
  mode: ListGroupMode
): ReservationGroup<T>[] {
  if (mode === 'flat') {
    return [{ key: 'all', label: '', items: list }];
  }

  const map = new Map<string, T[]>();
  for (const r of list) {
    let key: string;
    let label: string;
    switch (mode) {
      case 'by_day':
        key = dayKey(r) || 'unknown';
        label = key;
        break;
      case 'by_staff':
        key = staffLabel(r);
        label = key;
        break;
      case 'by_service':
        key = serviceLabel(r);
        label = key;
        break;
      default:
        key = 'all';
        label = '';
    }
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => {
      if (mode === 'by_day') return a.localeCompare(b);
      return a.localeCompare(b, 'tr');
    })
    .map(([key, items]) => ({ key, label: key, items }));
}

/** Saat dilimine göre grupla */
export function groupByHour<T extends SortableReservation>(
  list: T[]
): { hourKey: string; label: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const r of list) {
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

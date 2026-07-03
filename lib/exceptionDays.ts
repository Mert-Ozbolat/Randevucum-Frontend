import { reservationLocalCalendarKey } from '@/lib/reservationDate';

export interface ExceptionDay {
  date: string;
  reason?: string;
}

/** API'den gelen kapalı/izin gününü form için yyyy-MM-dd'ye çevirir. */
export function exceptionDayFromApi(raw: string | { date: string; reason?: string }): ExceptionDay {
  if (typeof raw === 'string') {
    const key = reservationLocalCalendarKey(raw);
    return { date: key || raw.slice(0, 10), reason: '' };
  }
  const key = reservationLocalCalendarKey(String(raw.date));
  return { date: key || String(raw.date).slice(0, 10), reason: raw.reason || '' };
}

export function exceptionDaysToApi(days: ExceptionDay[]): { date: string; reason: string }[] {
  return days
    .filter((d) => d.date)
    .map((d) => ({ date: d.date, reason: (d.reason || '').trim() }));
}

export function sortExceptionDays(days: ExceptionDay[]): ExceptionDay[] {
  return [...days].sort((a, b) => a.date.localeCompare(b.date));
}

export function addExceptionDay(
  days: ExceptionDay[],
  date: string,
  reason = ''
): ExceptionDay[] {
  const key = date.trim();
  if (!key) return days;
  const without = days.filter((d) => d.date !== key);
  return sortExceptionDays([...without, { date: key, reason: reason.trim() }]);
}

export function removeExceptionDay(days: ExceptionDay[], date: string): ExceptionDay[] {
  return days.filter((d) => d.date !== date);
}

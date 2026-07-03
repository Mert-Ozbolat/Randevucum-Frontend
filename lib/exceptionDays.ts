import { format, parseISO, isValid } from 'date-fns';
import { tr } from 'date-fns/locale';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';

export interface ExceptionRange {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

type ApiException =
  | string
  | {
      date?: string;
      startDate?: string;
      endDate?: string;
      reason?: string;
    };

function ymdFromApi(raw: string): string {
  const key = reservationLocalCalendarKey(raw);
  return key || raw.slice(0, 10);
}

export function exceptionRangeFromApi(raw: ApiException): ExceptionRange | null {
  if (typeof raw === 'string') {
    const date = ymdFromApi(raw);
    if (!date) return null;
    return { id: `${date}_${date}`, startDate: date, endDate: date, reason: '' };
  }

  const startRaw = raw.startDate || raw.date;
  const endRaw = raw.endDate || raw.startDate || raw.date;
  if (!startRaw) return null;

  const startDate = ymdFromApi(String(startRaw));
  const endDate = ymdFromApi(String(endRaw || startRaw));
  if (!startDate || !endDate) return null;

  const [from, to] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
  return {
    id: `${from}_${to}`,
    startDate: from,
    endDate: to,
    reason: raw.reason || '',
  };
}

export function exceptionRangesFromApi(list: ApiException[] | undefined): ExceptionRange[] {
  return sortExceptionRanges(
    (list || [])
      .map(exceptionRangeFromApi)
      .filter((x): x is ExceptionRange => Boolean(x))
  );
}

export function exceptionRangesToApi(ranges: ExceptionRange[]): {
  startDate: string;
  endDate: string;
  reason: string;
}[] {
  return ranges.map((r) => ({
    startDate: r.startDate,
    endDate: r.endDate,
    reason: (r.reason || '').trim(),
  }));
}

export function sortExceptionRanges(ranges: ExceptionRange[]): ExceptionRange[] {
  return [...ranges].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function addExceptionRange(
  ranges: ExceptionRange[],
  startDate: string,
  endDate: string,
  reason = ''
): ExceptionRange[] {
  const start = startDate.trim();
  const end = (endDate.trim() || start).trim();
  if (!start) return ranges;

  const [from, to] = start <= end ? [start, end] : [end, start];
  const id = `${from}_${to}`;
  const without = ranges.filter((r) => r.id !== id);
  return sortExceptionRanges([
    ...without,
    { id, startDate: from, endDate: to, reason: reason.trim() },
  ]);
}

export function removeExceptionRange(ranges: ExceptionRange[], id: string): ExceptionRange[] {
  return ranges.filter((r) => r.id !== id);
}

function parseLocalYmd(ymd: string): Date | null {
  const [y, mo, d] = ymd.split('-').map(Number);
  if (!y || !mo || !d) return null;
  const dt = new Date(y, mo - 1, d);
  return isValid(dt) ? dt : null;
}

export function formatExceptionRangeLabel(range: ExceptionRange): string {
  const start = parseLocalYmd(range.startDate);
  const end = parseLocalYmd(range.endDate);
  if (!start || !end) return range.startDate;

  if (range.startDate === range.endDate) {
    return format(start, 'd MMMM yyyy, EEEE', { locale: tr });
  }

  const sameYear = range.startDate.slice(0, 4) === range.endDate.slice(0, 4);
  const sameMonth = sameYear && range.startDate.slice(5, 7) === range.endDate.slice(5, 7);

  if (sameMonth) {
    return `${format(start, 'd', { locale: tr })} – ${format(end, 'd MMMM yyyy', { locale: tr })}`;
  }
  if (sameYear) {
    return `${format(start, 'd MMMM', { locale: tr })} – ${format(end, 'd MMMM yyyy', { locale: tr })}`;
  }
  return `${format(start, 'd MMM yyyy', { locale: tr })} – ${format(end, 'd MMM yyyy', { locale: tr })}`;
}

export function countDaysInRange(range: ExceptionRange): number {
  const start = parseISO(`${range.startDate}T12:00:00`);
  const end = parseISO(`${range.endDate}T12:00:00`);
  if (!isValid(start) || !isValid(end)) return 1;
  const diff = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(1, diff + 1);
}

// Geriye dönük uyumluluk
export type ExceptionDay = ExceptionRange;
export const exceptionDayFromApi = exceptionRangeFromApi;
export const exceptionDaysToApi = exceptionRangesToApi;
export const sortExceptionDays = sortExceptionRanges;
export const addExceptionDay = (days: ExceptionRange[], date: string, reason = '') =>
  addExceptionRange(days, date, date, reason);
export const removeExceptionDay = removeExceptionRange;

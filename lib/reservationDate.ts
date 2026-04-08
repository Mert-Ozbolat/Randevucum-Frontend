import { format, parseISO, isValid } from 'date-fns';

/**
 * Map API reservation `date` (ISO instant) to the user's local calendar day.
 * Do not use `iso.slice(0, 10)` — that is the UTC date and shifts vs. seçilen gün.
 */
export function reservationLocalCalendarKey(raw: string): string | null {
  try {
    const d = parseISO(raw);
    if (!isValid(d)) return null;
    return format(d, 'yyyy-MM-dd');
  } catch {
    return null;
  }
}

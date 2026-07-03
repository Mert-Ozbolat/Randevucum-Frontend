import { reservationLocalCalendarKey } from './reservationDate';

export const CUSTOMER_CANCEL_HOURS_BEFORE = 12;

export const CUSTOMER_CANCEL_POLICY_NOTICE = `Randevunuzu başlangıç saatinden en geç ${CUSTOMER_CANCEL_HOURS_BEFORE} saat öncesine kadar iptal edebilirsiniz. Bu süreden sonra iptal yapılamaz.`;

export type ReservationLike = {
  _id?: string;
  date: string;
  time: string;
  endTime?: string;
  status: string;
};

function timeToMinutes(t?: string | null): number {
  const [hh, mm] = String(t || '00:00').split(':');
  return (Number(hh) || 0) * 60 + (Number(mm) || 0);
}

/** Randevu günü + başlangıç saati → yerel Date. */
export function reservationStartAt(r: ReservationLike): Date | null {
  const raw = typeof r.date === 'string' ? r.date : String(r.date);
  const key = reservationLocalCalendarKey(raw);
  if (!key) return null;
  const [y, mo, d] = key.split('-').map(Number);
  if (!y || !mo || !d) return null;
  const startMin = timeToMinutes(r.time);
  const dt = new Date(y, mo - 1, d);
  dt.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
  return dt;
}

/** Müşteri iptal edebilir mi? (onaylı/bekleyen + başlangıca ≥12 saat) */
export function canCustomerCancelReservation(r: ReservationLike, now = new Date()): boolean {
  if (r.status !== 'approved' && r.status !== 'pending') return false;
  const start = reservationStartAt(r);
  if (!start) return false;
  const msUntil = start.getTime() - now.getTime();
  return msUntil >= CUSTOMER_CANCEL_HOURS_BEFORE * 60 * 60 * 1000;
}

/** İşletme panelinden iptal edilebilir mi? */
export function canBusinessCancelReservation(r: ReservationLike): boolean {
  if (r.status !== 'approved' && r.status !== 'pending') return false;
  return !isReservationPast(r);
}

/** Randevu günü + saat → yerel Date (bitiş saati varsa onu kullanır). */
export function reservationEndAt(r: ReservationLike): Date | null {
  const raw = typeof r.date === 'string' ? r.date : String(r.date);
  const key = reservationLocalCalendarKey(raw);
  if (!key) return null;
  const [y, mo, d] = key.split('-').map(Number);
  if (!y || !mo || !d) return null;
  const endMin = timeToMinutes(r.endTime || r.time);
  const dt = new Date(y, mo - 1, d);
  dt.setHours(Math.floor(endMin / 60), endMin % 60, 0, 0);
  return dt;
}

/** Randevu zamanı (bitiş) geçmiş mi? */
export function isReservationPast(r: ReservationLike, now = new Date()): boolean {
  const end = reservationEndAt(r);
  if (!end) return false;
  return end.getTime() < now.getTime();
}

/** Onay bekleyen ve hâlâ işlem yapılabilir (geçmemiş). */
export function isActionablePending(r: ReservationLike): boolean {
  return r.status === 'pending' && !isReservationPast(r);
}

/** Geçmişte kalmış bekleyen (süresi dolmuş, onaylanmadı). */
export function isExpiredPending(r: ReservationLike): boolean {
  return r.status === 'pending' && isReservationPast(r);
}

/** Geçmiş kayıt (iptal, tamamlanmış veya zamanı geçmiş). */
export function isPastReservationRecord(r: ReservationLike): boolean {
  if (r.status === 'canceled' || r.status === 'completed') return true;
  return isReservationPast(r);
}

export function sortByDateTimeAsc<T extends ReservationLike>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const ea = reservationEndAt(a)?.getTime() ?? 0;
    const eb = reservationEndAt(b)?.getTime() ?? 0;
    return ea - eb;
  });
}

export function sortByDateTimeDesc<T extends ReservationLike>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const ea = reservationEndAt(a)?.getTime() ?? 0;
    const eb = reservationEndAt(b)?.getTime() ?? 0;
    return eb - ea;
  });
}

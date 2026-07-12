'use client';

import { useEffect, useState } from 'react';
import { format, startOfDay, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';
import { CalendarDays, Clock, Mail, Scissors, User, UserRound, X, CheckCircle2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminReservationCard } from './AdminReservationCard';
import { canBusinessCancelReservation, canMarkAttendance } from '@/lib/reservationFilters';
import { ReservationStatusBadge } from '@/components/reservations/ReservationStatusBadge';
import { attendanceRateColor, formatAttendanceRate, type AttendanceStats } from '@/lib/attendance';
import {
  groupByHour,
  groupReservations,
  sortReservations,
  type CalendarLayoutMode,
  type ReservationSortMode,
} from '@/lib/reservationSort';

interface Reservation {
  _id: string;
  date: string;
  time: string;
  endTime?: string;
  status: string;
  serviceId?: { name: string; durationMinutes?: number };
  staffId?: { _id?: string; name: string; title?: string } | string | null;
  customerId?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    attendanceStats?: AttendanceStats;
  };
  attendance?: {
    outcome?: 'attended' | 'no_show' | null;
    markedAt?: string;
    note?: string;
  };
  reminders?: {
    customerRsvp?: 'confirmed' | 'canceled' | null;
    customerRsvpAt?: string | null;
  };
}

interface AdminCalendarProps {
  view: 'daily' | 'weekly';
  onViewChange: (view: 'daily' | 'weekly') => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  reservations: Reservation[];
  onCancel?: (id: string) => void;
  onMarkAttendance?: (id: string, outcome: 'attended' | 'no_show') => void;
  sortMode?: ReservationSortMode;
  calendarLayout?: CalendarLayoutMode;
}

/** Saat dilimine göre grupla — groupByHour import edildi */

function customerName(r: Reservation): string {
  const c = r.customerId;
  return c ? `${c.firstName} ${c.lastName}`.trim() || 'Müşteri' : 'Müşteri';
}

function customerRsvpLabel(rsvp?: 'confirmed' | 'canceled' | null): string | null {
  if (rsvp === 'confirmed') return 'Müşteri gelecek';
  if (rsvp === 'canceled') return 'Müşteri iptal etti';
  return null;
}

function reservationDayLabel(raw: string): string {
  const key = reservationLocalCalendarKey(raw);
  if (!key) return '—';
  const [year, month, day] = key.split('-').map(Number);
  return format(new Date(year, month - 1, day), 'd MMMM yyyy, EEEE', { locale: tr });
}

function ReservationClickCard({
  reservation,
  onSelect,
}: {
  reservation: Reservation;
  onSelect: (reservation: Reservation) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(reservation)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(reservation);
        }
      }}
      className="cursor-pointer rounded-xl outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary-500/40"
      aria-label={`${customerName(reservation)} randevu detayını aç`}
    >
      <AdminReservationCard variant="compact" reservation={reservation} />
    </div>
  );
}

export function ReservationDetailModal({
  reservation,
  onClose,
  onCancel,
  onMarkAttendance,
}: {
  reservation: Reservation;
  onClose: () => void;
  onCancel?: (id: string) => void;
  onMarkAttendance?: (id: string, outcome: 'attended' | 'no_show') => void;
}) {
  const c = reservation.customerId;
  const canCancel = canBusinessCancelReservation(reservation);
  const canMark = canMarkAttendance(reservation);
  const stats = c?.attendanceStats;
  const currentOutcome = reservation.attendance?.outcome;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Randevu detayı"
    >
      <div
        className="w-full max-w-lg animate-slide-up rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900 sm:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Randevu detayı</p>
            <h3 className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
              {customerName(reservation)}
            </h3>
            <p className="mt-1 text-sm capitalize text-neutral-500 dark:text-neutral-400">
              {reservationDayLabel(String(reservation.date))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="mt-4">
          <ReservationStatusBadge status={reservation.status} />
        </div>

        <div className="mt-5 grid gap-3">
          <DetailRow
            icon={Clock}
            label="Saat"
            value={`${reservation.time}${reservation.endTime ? ` – ${reservation.endTime}` : ''}${
              reservation.serviceId?.durationMinutes ? ` (${reservation.serviceId.durationMinutes} dk)` : ''
            }`}
          />
          <DetailRow icon={Scissors} label="Hizmet" value={reservation.serviceId?.name || '—'} />
          {typeof reservation.staffId === 'object' && reservation.staffId?.name && (
            <DetailRow icon={UserRound} label="Personel" value={reservation.staffId.name} />
          )}
          <DetailRow icon={User} label="Müşteri" value={customerName(reservation)} />
          {c?.email && <DetailRow icon={Mail} label="E-posta" value={c.email} />}
          {c?.phone && <DetailRow icon={User} label="Telefon" value={c.phone} />}
          {customerRsvpLabel(reservation.reminders?.customerRsvp) && (
            <DetailRow
              icon={CheckCircle2}
              label="WhatsApp yanıtı"
              value={customerRsvpLabel(reservation.reminders?.customerRsvp) || '—'}
            />
          )}
        </div>

        {stats && (stats.totalMarked ?? 0) > 0 && (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Müşteri katılım oranı</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className={`text-2xl font-bold tabular-nums ${attendanceRateColor(stats.attendanceRate ?? 100)}`}>
                {formatAttendanceRate(stats)}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                ({stats.attendedCount ?? 0} katıldı · {stats.noShowCount ?? 0} gelmedi)
              </span>
            </div>
          </div>
        )}

        {canMark && onMarkAttendance && (
          <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Randevuya geldi mi?
            </p>
            <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80">
              Müşteri gelmediyse uyarı mesajı gönderilir ve katılım puanı güncellenir.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant={currentOutcome === 'attended' ? 'primary' : 'outline'}
                fullWidth
                className="sm:flex-1"
                onClick={() => {
                  onMarkAttendance(reservation._id, 'attended');
                  onClose();
                }}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden />
                Katıldı
              </Button>
              <Button
                type="button"
                variant={currentOutcome === 'no_show' ? 'danger' : 'outline'}
                fullWidth
                className="sm:flex-1"
                onClick={() => {
                  if (!confirm('Müşteri randevuya gelmedi olarak işaretlensin mi? Müşteriye uyarı mesajı gönderilecek.')) return;
                  onMarkAttendance(reservation._id, 'no_show');
                  onClose();
                }}
              >
                <UserX className="mr-1.5 h-4 w-4" aria-hidden />
                Gelmedi
              </Button>
            </div>
            {currentOutcome && (
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Mevcut işaretleme: {currentOutcome === 'attended' ? 'Katıldı' : 'Gelmedi'} — değiştirmek için tekrar seçin.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" fullWidth className="sm:w-auto" onClick={onClose}>
            Kapat
          </Button>
          {canCancel && onCancel && (
            <Button
              type="button"
              variant="danger"
              fullWidth
              className="sm:w-auto"
              onClick={() => {
                onCancel(reservation._id);
                onClose();
              }}
            >
              Randevuyu iptal et
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-neutral-50 px-3 py-3 dark:bg-neutral-800/60">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function staffName(r: Reservation): string | null {
  const s = r.staffId;
  if (!s) return null;
  if (typeof s === 'string') return null;
  return s.name || null;
}

const STATUS_ACCENT: Record<string, string> = {
  approved: 'bg-emerald-500',
  pending: 'bg-amber-500',
  completed: 'bg-sky-500',
  no_show: 'bg-red-500',
  canceled: 'bg-neutral-300 dark:bg-neutral-600',
};

/** Günlük agenda satırı: solda büyük saat, sağda randevu kartı */
function DayAgendaRow({
  group,
  isToday,
  onSelect,
}: {
  group: { hourKey: string; label: string; items: Reservation[] };
  isToday: boolean;
  onSelect: (reservation: Reservation) => void;
}) {
  return (
    <div className="flex gap-3 sm:gap-5">
      {/* Saat sütunu */}
      <div className="flex w-14 shrink-0 flex-col items-center pt-1 sm:w-20">
        <span
          className={`font-mono text-lg font-extrabold tabular-nums leading-none sm:text-2xl ${
            isToday ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-800 dark:text-neutral-100'
          }`}
        >
          {group.hourKey}
          <span className="text-neutral-400 dark:text-neutral-500">:00</span>
        </span>
        <span className="mt-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {group.items.length}
        </span>
      </div>

      {/* Dikey çizgi + kartlar */}
      <div className="relative min-w-0 flex-1 border-l-2 border-neutral-200 pb-5 pl-4 dark:border-neutral-700 sm:pl-5">
        <span
          className={`absolute -left-[7px] top-2 h-3 w-3 rounded-full ring-4 ring-white dark:ring-neutral-900 ${
            isToday ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'
          }`}
          aria-hidden
        />
        <div className="space-y-2.5">
          {group.items.map((r) => (
            <DayAgendaCard key={r._id} reservation={r} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Günlük görünümde okunaklı, büyük randevu kartı */
function DayAgendaCard({
  reservation,
  onSelect,
}: {
  reservation: Reservation;
  onSelect: (reservation: Reservation) => void;
}) {
  const c = reservation.customerId;
  const canceled = reservation.status === 'canceled';
  const sName = staffName(reservation);
  const initials =
    `${(c?.firstName || '').charAt(0)}${(c?.lastName || '').charAt(0)}`.toUpperCase() || '?';

  return (
    <button
      type="button"
      onClick={() => onSelect(reservation)}
      className={`group flex w-full items-center gap-3 rounded-2xl border bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:bg-neutral-900/70 sm:p-4 ${
        canceled
          ? 'border-neutral-200 opacity-60 dark:border-neutral-700'
          : 'border-neutral-200/90 dark:border-neutral-700'
      }`}
    >
      {/* Durum şeridi */}
      <span
        className={`h-12 w-1.5 shrink-0 rounded-full ${STATUS_ACCENT[reservation.status] || 'bg-neutral-400'}`}
        aria-hidden
      />

      {/* Saat bloğu */}
      <div className="flex w-[4.5rem] shrink-0 flex-col items-center rounded-xl bg-neutral-50 px-2 py-1.5 dark:bg-neutral-800/70">
        <span className="font-mono text-base font-bold tabular-nums text-neutral-900 dark:text-white">
          {reservation.time}
        </span>
        {reservation.endTime && (
          <span className="font-mono text-[11px] tabular-nums text-neutral-400">
            {reservation.endTime}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white sm:flex"
        aria-hidden
      >
        {initials}
      </div>

      {/* Bilgi */}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-base font-semibold text-neutral-900 dark:text-white ${canceled ? 'line-through' : ''}`}>
          {customerName(reservation)}
        </p>
        <p className="mt-0.5 truncate text-sm text-neutral-600 dark:text-neutral-300">
          {reservation.serviceId?.name || 'Hizmet'}
          {reservation.serviceId?.durationMinutes ? (
            <span className="text-neutral-400"> · {reservation.serviceId.durationMinutes} dk</span>
          ) : null}
        </p>
        {sName && (
          <p className="mt-0.5 truncate text-xs text-neutral-400 dark:text-neutral-500">{sName}</p>
        )}
      </div>

      {/* Durum + ipucu */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <ReservationStatusBadge status={reservation.status} />
        <span className="hidden text-[11px] font-medium text-primary-500 opacity-0 transition group-hover:opacity-100 sm:inline">
          Detay →
        </span>
      </div>
    </button>
  );
}

/** Günlük görünüm: dikey zaman çizelgesi veya alternatif düzenler */
function DayAgenda({
  day,
  reservations,
  isToday,
  onSelect,
  sortMode,
  layout,
}: {
  day: Date;
  reservations: Reservation[];
  isToday: boolean;
  onSelect: (reservation: Reservation) => void;
  sortMode: ReservationSortMode;
  layout: CalendarLayoutMode;
}) {
  const sorted = sortReservations(reservations, sortMode);
  const grouped = groupByHour(sorted);
  const count = reservations.length;

  const renderCards = (items: Reservation[]) =>
    items.map((r) => <DayAgendaCard key={r._id} reservation={r} onSelect={onSelect} />);

  const renderBody = () => {
    if (layout === 'timeline') {
      return grouped.map((group) => (
        <DayAgendaRow key={group.hourKey} group={group} isToday={isToday} onSelect={onSelect} />
      ));
    }

    if (layout === 'hour_grid') {
      return grouped.map((group) => (
        <div key={group.hourKey} className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-lg font-bold tabular-nums text-primary-600 dark:text-primary-400">
              {group.label}
            </span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800">
              {group.items.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{renderCards(group.items)}</div>
        </div>
      ));
    }

    if (layout === 'by_staff') {
      const groups = groupReservations(sorted, 'by_staff');
      return groups.map((g) => (
        <div key={g.key} className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-800 dark:text-neutral-100">
            <UserRound className="h-4 w-4 text-primary-500" aria-hidden />
            {g.label}
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-normal text-neutral-500 dark:bg-neutral-800">
              {g.items.length}
            </span>
          </h4>
          <div className="space-y-2">{renderCards(g.items)}</div>
        </div>
      ));
    }

    if (layout === 'by_service') {
      const groups = groupReservations(sorted, 'by_service');
      return groups.map((g) => (
        <div key={g.key} className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-800 dark:text-neutral-100">
            <Scissors className="h-4 w-4 text-primary-500" aria-hidden />
            {g.label}
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-normal text-neutral-500 dark:bg-neutral-800">
              {g.items.length}
            </span>
          </h4>
          <div className="space-y-2">{renderCards(g.items)}</div>
        </div>
      ));
    }

    // compact
    return <div className="space-y-2">{renderCards(sorted)}</div>;
  };

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-card dark:border-neutral-700 dark:bg-neutral-900/50">
      {/* Gün başlığı */}
      <div
        className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
          isToday
            ? 'border-primary-200/70 bg-gradient-to-r from-primary-50/90 to-white dark:border-primary-800/50 dark:from-primary-950/30 dark:to-neutral-900/0'
            : 'border-neutral-200/80 bg-neutral-50/70 dark:border-neutral-700/80 dark:bg-neutral-900/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-center ${
              isToday
                ? 'bg-primary-500 text-white shadow-sm dark:bg-primary-600'
                : 'bg-white text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-600'
            }`}
          >
            <span className="text-xl font-extrabold leading-none tabular-nums">{format(day, 'd')}</span>
            <span className="mt-0.5 text-[10px] font-bold uppercase leading-none opacity-90">
              {format(day, 'MMM', { locale: tr })}
            </span>
          </span>
          <div>
            <p className="text-lg font-bold capitalize text-neutral-900 dark:text-neutral-50">
              {format(day, 'EEEE', { locale: tr })}
              {isToday && (
                <span className="ml-2 rounded-full bg-primary-500 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white">
                  Bugün
                </span>
              )}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {format(day, 'd MMMM yyyy', { locale: tr })}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-600">
          <Clock className="h-4 w-4 text-primary-500" strokeWidth={2} aria-hidden />
          {count} randevu
        </span>
      </div>

      {/* Çizelge */}
      {count === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <CalendarDays className="h-7 w-7 text-neutral-400" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-4 text-base font-medium text-neutral-600 dark:text-neutral-300">
            Bu gün için randevu yok
          </p>
        </div>
      ) : (
        <div className="px-4 py-6 sm:px-6">{renderBody()}</div>
      )}
    </div>
  );
}

export function AdminCalendar({
  view,
  onViewChange,
  selectedDate,
  onDateChange,
  reservations,
  onCancel,
  onMarkAttendance,
  sortMode = 'time_asc',
  calendarLayout = 'timeline',
}: AdminCalendarProps) {
  const todayStart = startOfDay(new Date());
  const dayStart = view === 'weekly' ? todayStart : startOfDay(selectedDate);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const days =
    view === 'weekly'
      ? Array.from({ length: 7 }, (_, i) => addDays(todayStart, i))
      : [dayStart];

  const reservationsByDay = days.map((d) => {
    const dateStr = format(d, 'yyyy-MM-dd');
    return reservations.filter((r) => {
      const raw = typeof r.date === 'string' ? r.date : String(r.date);
      const key = reservationLocalCalendarKey(raw);
      return key === dateStr;
    });
  });

  const todayStr = format(todayStart, 'yyyy-MM-dd');
  const todayCount = reservations.filter((r) => {
    const raw = typeof r.date === 'string' ? r.date : String(r.date);
    return reservationLocalCalendarKey(raw) === todayStr;
  }).length;

  const listMaxHeightClass = 'max-h-[min(52vh,480px)]';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/90 bg-gradient-to-r from-white to-neutral-50/80 p-4 shadow-card dark:border-neutral-700 dark:from-neutral-900/80 dark:to-neutral-900/40 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-600 dark:bg-neutral-800">
            {(['daily', 'weekly'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  if (v === 'weekly') onDateChange(todayStart);
                  onViewChange(v);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  view === v
                    ? 'bg-primary-500 text-white shadow-sm dark:bg-primary-600'
                    : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700/50'
                }`}
              >
                {v === 'daily' ? 'Günlük' : 'Haftalık'}
              </button>
            ))}
          </div>
          {view === 'weekly' && (
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {format(todayStart, 'd MMMM', { locale: tr })} –{' '}
              {format(addDays(todayStart, 6), 'd MMMM yyyy', { locale: tr })}
              <span className="ml-1 font-normal text-neutral-500 dark:text-neutral-400">
                (bugünden itibaren 7 gün)
              </span>
            </p>
          )}
          {view === 'daily' && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onDateChange(addDays(selectedDate, -1))}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                ← Önceki gün
              </button>
              <button
                type="button"
                onClick={() => onDateChange(startOfDay(new Date()))}
                className="rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-200 dark:hover:bg-primary-900/40"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => onDateChange(addDays(selectedDate, 1))}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                Sonraki gün →
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/50">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            Bugün: {todayCount}
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 sm:text-left">
        {view === 'weekly'
          ? 'Haftalık görünüm bugünden başlayarak önümüzdeki 7 günü gösterir.'
          : 'Görünüm ve sıralama tercihlerinize göre listelenir; detay için karta dokunun.'}
      </p>

      {view === 'daily' ? (
        <DayAgenda
          day={days[0]}
          reservations={reservationsByDay[0]}
          isToday={isSameDay(days[0], new Date())}
          onSelect={setSelectedReservation}
          sortMode={sortMode}
          layout={calendarLayout}
        />
      ) : (
        <div className="mx-auto grid w-full gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {days.map((d, i) => {
            const isToday = isSameDay(d, new Date());
            const dayRes = reservationsByDay[i];
            const sorted = sortReservations(dayRes, sortMode);
            const grouped = groupByHour(sorted);
            const count = dayRes.length;

            return (
              <div
                key={d.toISOString()}
                className={`flex min-h-0 flex-col rounded-2xl border p-4 shadow-card transition dark:shadow-none ${
                  isToday
                    ? 'border-primary-300/80 bg-gradient-to-b from-primary-50/90 to-white dark:border-primary-700/50 dark:from-primary-950/30 dark:to-neutral-900/60'
                    : 'border-neutral-200/90 bg-neutral-50/40 dark:border-neutral-700 dark:bg-neutral-900/40'
                }`}
              >
                <div className="shrink-0 border-b border-neutral-200/80 pb-3 dark:border-neutral-700/80">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold leading-tight text-neutral-900 dark:text-white">
                      {format(d, 'd MMMM', { locale: tr })}
                      <span className="block text-xs font-medium capitalize text-neutral-500 dark:text-neutral-400">
                        {format(d, 'EEEE', { locale: tr })}
                      </span>
                    </h3>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {isToday && (
                        <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Bugün
                        </span>
                      )}
                      {count > 0 && (
                        <span className="rounded-full bg-neutral-200/90 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                          {count} randevu
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {count === 0 ? (
                  <div className="mt-4 shrink-0 rounded-xl border border-dashed border-neutral-200 bg-white/60 py-10 text-center dark:border-neutral-600 dark:bg-neutral-900/30">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Bu gün randevu yok</p>
                  </div>
                ) : (
                  <div
                    className={`mt-3 min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth pr-1 ${listMaxHeightClass} [scrollbar-gutter:stable] [overscroll-behavior:contain]`}
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <div className="space-y-4 pb-1">
                      {grouped.map((group) => (
                        <div key={group.hourKey}>
                          <div
                            className={`sticky top-0 z-[1] -mx-1 mb-2 flex items-center gap-2 px-1 py-1 ${
                              isToday
                                ? 'bg-primary-50/95 dark:bg-primary-950/90'
                                : 'bg-neutral-50/95 dark:bg-neutral-900/90'
                            } backdrop-blur-sm`}
                          >
                            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-600" />
                            <span className="shrink-0 text-[11px] font-bold tabular-nums text-neutral-500 dark:text-neutral-400">
                              {group.label}
                              <span className="ml-1 font-normal text-neutral-400">({group.items.length})</span>
                            </span>
                            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-600" />
                          </div>
                          <ul className="space-y-2">
                            {group.items.map((r) => (
                              <li key={r._id}>
                                <ReservationClickCard reservation={r} onSelect={setSelectedReservation} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onCancel={onCancel}
          onMarkAttendance={onMarkAttendance}
        />
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarDays, ClipboardList, History, Radio, Store } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { AdminCalendar } from '@/components/admin/AdminCalendar';
import { AdminReservationCard } from '@/components/admin/AdminReservationCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { startOfDay } from 'date-fns';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';
import {
  isPastReservationRecord,
  isReservationPast,
  sortByDateTimeAsc,
  sortByDateTimeDesc,
} from '@/lib/reservationFilters';
import { useToast } from '@/components/ui/Toast';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { useBusinessReservationsLive } from '@/contexts/BusinessReservationsLiveContext';

type PageTab = 'calendar' | 'list' | 'past';

function formatReservationDay(raw: string): string {
  const key = reservationLocalCalendarKey(raw);
  if (!key) return '—';
  const [y, mo, d] = key.split('-').map(Number);
  const dt = new Date(y, mo - 1, d);
  return format(dt, 'd MMMM yyyy, EEEE', { locale: tr });
}

export default function BusinessReservationsPage() {
  const {
    businessId,
    reservations,
    loading,
    error: liveError,
    isLive,
    updateReservation,
  } = useBusinessReservationsLive();
  const [error, setError] = useState('');
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [tab, setTab] = useState<PageTab>('calendar');
  const { addToast } = useToast();

  const displayError = error || liveError;

  const stats = useMemo(() => {
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const today = reservations.filter((r) => {
      const raw = typeof r.date === 'string' ? r.date : String(r.date);
      return reservationLocalCalendarKey(raw) === todayStr && r.status !== 'canceled';
    }).length;
    const upcoming = reservations.filter(
      (r) => r.status !== 'canceled' && !isReservationPast(r)
    ).length;
    const past = reservations.filter(isPastReservationRecord).length;
    return { today, upcoming, past, total: reservations.length };
  }, [reservations]);

  const upcomingList = useMemo(
    () =>
      sortByDateTimeAsc(
        reservations.filter((r) => r.status !== 'canceled' && !isPastReservationRecord(r))
      ),
    [reservations]
  );

  const pastList = useMemo(
    () => sortByDateTimeDesc(reservations.filter(isPastReservationRecord)),
    [reservations]
  );

  const handleCancel = async (id: string) => {
    if (!confirm('Bu randevuyu iptal etmek istediğinize emin misiniz?')) return;
    setError('');
    try {
      await api.patch(`/reservations/${id}/status`, { status: 'canceled' });
      updateReservation(id, { status: 'canceled' });
      addToast('success', 'Randevu iptal edildi.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-36 animate-pulse rounded-3xl bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-14 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnimateIn immediate animation="slide-up">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-900 px-6 py-8 text-white shadow-soft sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary-500/10 blur-2xl" />
          <p className="text-sm font-medium text-emerald-200/90">İşletme paneli</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Randevu yönetimi</h1>
            {isLive && businessId && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/30">
                <Radio className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} aria-hidden />
                Canlı
              </span>
            )}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
            Yeni randevular otomatik onaylanır. Takvimden günlük/haftalık planınızı görün ve gerekirse
            randevuyu iptal edin.
          </p>
          {businessId && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-slate-300">Bugün</p>
                <p className="text-2xl font-bold tabular-nums">{stats.today}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-slate-300">Yaklaşan</p>
                <p className="text-2xl font-bold tabular-nums text-emerald-200">{stats.upcoming}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-slate-300">Geçmiş</p>
                <p className="text-2xl font-bold tabular-nums">{stats.past}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-slate-300">Toplam</p>
                <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
              </div>
            </div>
          )}
        </div>
      </AnimateIn>

      {displayError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {displayError}
        </div>
      )}

      {!businessId ? (
        <Card className="rounded-3xl border-dashed border-2 p-10 text-center dark:border-neutral-600">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <Store className="h-8 w-8 text-neutral-500 dark:text-neutral-400" strokeWidth={1.5} aria-hidden />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Henüz işletme profiliniz yok
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
            Randevuları görmek için önce işletme bilgilerinizi tamamlayın.
          </p>
          <Link href="/dashboard/business/info" className="mt-6 inline-block">
            <Button className="rounded-xl px-6">İşletme oluştur</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-1.5 dark:border-neutral-700 dark:bg-neutral-900/50">
            {(
              [
                { id: 'calendar' as const, label: 'Takvim', Icon: CalendarDays },
                { id: 'list' as const, label: 'Yaklaşan liste', Icon: ClipboardList },
                { id: 'past' as const, label: 'Geçmiş', Icon: History },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  tab === id
                    ? 'bg-white text-primary-700 shadow-card dark:bg-neutral-800 dark:text-primary-400'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {tab === 'calendar' && (
            <AdminCalendar
              view={view}
              onViewChange={setView}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              reservations={reservations}
              onCancel={handleCancel}
            />
          )}

          {tab === 'list' && (
            <section className="space-y-4">
              {upcomingList.length === 0 ? (
                <Card className="rounded-2xl border-dashed p-10 text-center">
                  <p className="text-neutral-600 dark:text-neutral-400">Yaklaşan randevu yok.</p>
                </Card>
              ) : (
                <ul className="space-y-4">
                  {upcomingList.map((r) => (
                    <li key={r._id}>
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatReservationDay(r.date)}
                        </span>
                        <span className="font-mono text-neutral-500 dark:text-neutral-400">
                          {r.time}
                          {r.endTime ? ` – ${r.endTime}` : ''}
                        </span>
                        {r.staffId?.name && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            {r.staffId.name}
                          </span>
                        )}
                      </div>
                      <AdminReservationCard reservation={r} onCancel={handleCancel} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {tab === 'past' && (
            <section className="space-y-4">
              {pastList.length === 0 ? (
                <Card className="rounded-2xl border-dashed p-10 text-center">
                  <p className="text-neutral-600 dark:text-neutral-400">Geçmiş randevu kaydı yok.</p>
                </Card>
              ) : (
                <ul className="space-y-3">
                  {pastList.map((r) => (
                    <li key={r._id} className="rounded-2xl opacity-75">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <span>{formatReservationDay(r.date)}</span>
                        <span className="font-mono">
                          {r.time}
                          {r.endTime ? ` – ${r.endTime}` : ''}
                        </span>
                      </div>
                      <AdminReservationCard reservation={r} onCancel={handleCancel} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format, startOfDay } from 'date-fns';
import { CalendarDays, ClipboardList, Filter, History, Radio, Store, Users } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { AdminCalendar, ReservationDetailModal } from '@/components/admin/AdminCalendar';
import { ReservationGroupedList } from '@/components/admin/ReservationGroupedList';
import { ReservationViewControls } from '@/components/admin/ReservationViewControls';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';
import {
  isPastReservationRecord,
  isReservationPast,
  needsAttendanceMarking,
} from '@/lib/reservationFilters';
import {
  loadReservationViewPrefs,
  saveReservationViewPrefs,
  type ReservationViewPrefs,
} from '@/lib/reservationViewPrefs';
import { useToast } from '@/components/ui/Toast';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { useBusinessReservationsLive, type BusinessReservation } from '@/contexts/BusinessReservationsLiveContext';

type PageTab = 'calendar' | 'list' | 'past';
type StaffFilter = 'all' | 'unassigned' | string;

interface StaffOption {
  _id: string;
  name: string;
  title?: string;
}

function reservationStaffId(r: { staffId?: { _id?: string; name?: string } | string | null }): string | null {
  const s = r.staffId;
  if (!s) return null;
  if (typeof s === 'string') return s;
  if (s._id) return String(s._id);
  return null;
}

function matchesStaffFilter(
  r: { staffId?: { _id?: string; name?: string } | string | null },
  filter: StaffFilter
): boolean {
  if (filter === 'all') return true;
  if (filter === 'unassigned') return !reservationStaffId(r);
  return reservationStaffId(r) === filter;
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
  const [staffFilter, setStaffFilter] = useState<StaffFilter>('all');
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [viewPrefs, setViewPrefs] = useState<ReservationViewPrefs>(() => loadReservationViewPrefs(null));
  const [selectedReservation, setSelectedReservation] = useState<BusinessReservation | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (businessId) {
      setViewPrefs(loadReservationViewPrefs(businessId));
    }
  }, [businessId]);

  const updateViewPrefs = (patch: Partial<ReservationViewPrefs>) => {
    setViewPrefs((prev) => {
      const next = { ...prev, ...patch };
      if (businessId) saveReservationViewPrefs(businessId, next);
      return next;
    });
  };

  useEffect(() => {
    if (!businessId) {
      setStaffList([]);
      return;
    }
    api
      .get<{ data: StaffOption[] }>(`/staff/business/${businessId}`)
      .then((res) => setStaffList(res.data.data || []))
      .catch(() => setStaffList([]));
  }, [businessId]);

  const filteredReservations = useMemo(
    () => reservations.filter((r) => matchesStaffFilter(r, staffFilter)),
    [reservations, staffFilter]
  );

  const hasUnassigned = useMemo(
    () => reservations.some((r) => !reservationStaffId(r)),
    [reservations]
  );

  const displayError = error || liveError;

  const stats = useMemo(() => {
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const today = filteredReservations.filter((r) => {
      const raw = typeof r.date === 'string' ? r.date : String(r.date);
      return reservationLocalCalendarKey(raw) === todayStr && r.status !== 'canceled';
    }).length;
    const upcoming = filteredReservations.filter(
      (r) => r.status !== 'canceled' && !isReservationPast(r)
    ).length;
    const past = filteredReservations.filter(isPastReservationRecord).length;
    return { today, upcoming, past, total: filteredReservations.length };
  }, [filteredReservations]);

  const upcomingList = useMemo(
    () => filteredReservations.filter((r) => r.status !== 'canceled' && !isPastReservationRecord(r)),
    [filteredReservations]
  );

  const pastList = useMemo(
    () => filteredReservations.filter(isPastReservationRecord),
    [filteredReservations]
  );

  const unmarkedPastCount = useMemo(
    () => filteredReservations.filter(needsAttendanceMarking).length,
    [filteredReservations]
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

  const handleMarkAttendance = async (id: string, outcome: 'attended' | 'no_show') => {
    setError('');
    try {
      const res = await api.patch<{ data: BusinessReservation }>(`/reservations/${id}/attendance`, { outcome });
      const updated = res.data.data;
      updateReservation(id, {
        status: updated.status,
        attendance: updated.attendance,
        customerId: updated.customerId,
      });
      addToast(
        'success',
        outcome === 'attended' ? 'Müşteri katıldı olarak işaretlendi.' : 'Müşteri gelmedi olarak işaretlendi. Uyarı gönderildi.'
      );
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
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-1.5 dark:border-neutral-700 dark:bg-neutral-900/50 sm:flex sm:flex-wrap sm:gap-2">
            {(
              [
                { id: 'calendar' as const, label: 'Takvim', shortLabel: 'Takvim', Icon: CalendarDays },
                { id: 'list' as const, label: 'Yaklaşan liste', shortLabel: 'Liste', Icon: ClipboardList },
                { id: 'past' as const, label: 'Geçmiş', shortLabel: 'Geçmiş', Icon: History },
              ] as const
            ).map(({ id, label, shortLabel, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition sm:gap-2 sm:px-4 sm:text-sm ${
                  tab === id
                    ? 'bg-white text-primary-700 shadow-card dark:bg-neutral-800 dark:text-primary-400'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {(staffList.length > 0 || hasUnassigned) && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-card dark:border-neutral-700 dark:bg-neutral-900/60">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                <Filter className="h-4 w-4 text-primary-500" strokeWidth={2} aria-hidden />
                Personel filtresi
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStaffFilter('all')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                    staffFilter === 'all'
                      ? 'bg-primary-500 text-white shadow-sm dark:bg-primary-600'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  Tüm randevular
                </button>
                {staffList.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => setStaffFilter(s._id)}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                      staffFilter === s._id
                        ? 'bg-primary-500 text-white shadow-sm dark:bg-primary-600'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {s.name}
                    {s.title ? (
                      <span className="ml-1 font-normal opacity-80">· {s.title}</span>
                    ) : null}
                  </button>
                ))}
                {hasUnassigned && (
                  <button
                    type="button"
                    onClick={() => setStaffFilter('unassigned')}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                      staffFilter === 'unassigned'
                        ? 'bg-primary-500 text-white shadow-sm dark:bg-primary-600'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    Atanmamış
                  </button>
                )}
              </div>
              {staffFilter !== 'all' && (
                <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                  {filteredReservations.length} randevu gösteriliyor
                </p>
              )}
            </div>
          )}

          {unmarkedPastCount > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <strong>{unmarkedPastCount} geçmiş randevu</strong> henüz işaretlenmedi. Randevuya gelip gelmediğini
              işaretleyerek müşteri katılım puanını güncelleyebilirsiniz.
            </div>
          )}

          <ReservationViewControls
            sortMode={viewPrefs.sortMode}
            onSortModeChange={(sortMode) => updateViewPrefs({ sortMode })}
            calendarLayout={viewPrefs.calendarLayout}
            onCalendarLayoutChange={(calendarLayout) => updateViewPrefs({ calendarLayout })}
            listGroup={viewPrefs.listGroup}
            onListGroupChange={(listGroup) => updateViewPrefs({ listGroup })}
            showCalendarLayout={tab === 'calendar'}
            showListGroup={tab === 'list' || tab === 'past'}
          />

          {tab === 'calendar' && (
            <AdminCalendar
              view={view}
              onViewChange={setView}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              reservations={filteredReservations}
              onCancel={handleCancel}
              onMarkAttendance={handleMarkAttendance}
              sortMode={viewPrefs.sortMode}
              calendarLayout={viewPrefs.calendarLayout}
            />
          )}

          {tab === 'list' && (
            <section className="space-y-4">
              {upcomingList.length === 0 ? (
                <Card className="rounded-2xl border-dashed p-10 text-center">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {staffFilter === 'all'
                      ? 'Yaklaşan randevu yok.'
                      : staffFilter === 'unassigned'
                        ? 'Atanmamış yaklaşan randevu yok.'
                        : 'Seçilen personel için yaklaşan randevu yok.'}
                  </p>
                </Card>
              ) : (
                <ReservationGroupedList
                  reservations={upcomingList}
                  sortMode={viewPrefs.sortMode}
                  groupMode={viewPrefs.listGroup}
                  onCancel={handleCancel}
                  onSelect={(r) => setSelectedReservation(r)}
                />
              )}
            </section>
          )}

          {tab === 'past' && (
            <section className="space-y-4">
              {pastList.length === 0 ? (
                <Card className="rounded-2xl border-dashed p-10 text-center">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {staffFilter === 'all'
                      ? 'Geçmiş randevu kaydı yok.'
                      : staffFilter === 'unassigned'
                        ? 'Atanmamış geçmiş randevu yok.'
                        : 'Seçilen personel için geçmiş randevu yok.'}
                  </p>
                </Card>
              ) : (
                <ReservationGroupedList
                  reservations={pastList}
                  sortMode={viewPrefs.sortMode}
                  groupMode={viewPrefs.listGroup}
                  onCancel={handleCancel}
                  onSelect={(r) => setSelectedReservation(r)}
                  dimPast
                />
              )}
            </section>
          )}

          {selectedReservation && tab !== 'calendar' && (
            <ReservationDetailModal
              reservation={selectedReservation}
              onClose={() => setSelectedReservation(null)}
              onCancel={handleCancel}
              onMarkAttendance={handleMarkAttendance}
            />
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Store } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { AdminCalendar } from '@/components/admin/AdminCalendar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { startOfDay, format } from 'date-fns';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';
import { useToast } from '@/components/ui/Toast';

interface Reservation {
  _id: string;
  date: string;
  time: string;
  endTime?: string;
  status: string;
  serviceId?: { name: string; durationMinutes: number };
  staffId?: { name: string };
  customerId?: { firstName: string; lastName: string; email?: string };
}

export default function BusinessReservationsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const { addToast } = useToast();

  useEffect(() => {
    api
      .get<{ data: { _id: string }[] }>('/business')
      .then((res) => {
        const list = res.data.data || [];
        if (list[0]) {
          setBusinessId(list[0]._id);
          return api.get<{ data: Reservation[] }>(`/reservations/business/${list[0]._id}`);
        }
        return null;
      })
      .then((res) => {
        if (res) setReservations(res.data.data || []);
      })
      .catch(() => setError('Yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const pending = reservations.filter((r) => r.status === 'pending').length;
    const approved = reservations.filter((r) => r.status === 'approved').length;
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const today = reservations.filter((r) => {
      const raw = typeof r.date === 'string' ? r.date : String(r.date);
      return reservationLocalCalendarKey(raw) === todayStr;
    }).length;
    return { pending, approved, today, total: reservations.length };
  }, [reservations]);

  const handleStatus = async (id: string, status: 'approved' | 'canceled') => {
    setError('');
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      setReservations((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
      addToast('success', status === 'approved' ? 'Randevu onaylandı.' : 'Randevu iptal edildi.');
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-900 px-6 py-8 text-white shadow-soft sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary-500/10 blur-2xl" />
        <p className="text-sm font-medium text-emerald-200/90">İşletme paneli</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Randevu takvimi</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-300">
          Günlük veya haftalık görünümde randevularınızı yönetin; bekleyen talepleri onaylayın veya iptal edin.
        </p>
        {businessId && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-medium text-slate-300">Bugün</p>
              <p className="text-2xl font-bold tabular-nums">{stats.today}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-medium text-slate-300">Bekleyen</p>
              <p className="text-2xl font-bold tabular-nums text-amber-200">{stats.pending}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-medium text-slate-300">Onaylı</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-200">{stats.approved}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-medium text-slate-300">Toplam kayıt</p>
              <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
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
        <AdminCalendar
          view={view}
          onViewChange={setView}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          reservations={reservations}
          onApprove={(id) => handleStatus(id, 'approved')}
          onCancel={(id) => handleStatus(id, 'canceled')}
        />
      )}
    </div>
  );
}

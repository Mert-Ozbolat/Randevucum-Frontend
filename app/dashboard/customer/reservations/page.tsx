'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { isBefore, parseISO, startOfDay } from 'date-fns';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import {
  CustomerReservationCard,
  type CustomerReservationItem,
} from '@/components/reservations/CustomerReservationCard';

type FilterTab = 'all' | 'upcoming' | 'past';

function dayOnly(d: string): Date {
  return startOfDay(parseISO(d));
}

function isUpcomingReservation(r: CustomerReservationItem): boolean {
  if (r.status === 'canceled') return false;
  try {
    const raw = typeof r.date === 'string' ? r.date : String(r.date);
    const d = dayOnly(raw);
    const today = startOfDay(new Date());
    return !isBefore(d, today);
  } catch {
    return false;
  }
}

function isPastReservation(r: CustomerReservationItem): boolean {
  try {
    const raw = typeof r.date === 'string' ? r.date : String(r.date);
    const d = dayOnly(raw);
    const today = startOfDay(new Date());
    if (r.status === 'canceled' || r.status === 'completed') return true;
    return isBefore(d, today);
  } catch {
    return true;
  }
}

function timeToMinutesSafe(t?: string | null): number {
  const s = String(t || '');
  const [hh, mm] = s.split(':');
  const h = Number(hh);
  const m = Number(mm);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function sortReservations(list: CustomerReservationItem[]): CustomerReservationItem[] {
  return [...list].sort((a, b) => {
    // En yeni en üstte: tarih DESC, sonra saat DESC
    const da = typeof a.date === 'string' ? a.date : String(a.date);
    const db = typeof b.date === 'string' ? b.date : String(b.date);
    const ta = (() => {
      try {
        return parseISO(da).getTime() + timeToMinutesSafe(a.time) * 60_000;
      } catch {
        return 0;
      }
    })();
    const tb = (() => {
      try {
        return parseISO(db).getTime() + timeToMinutesSafe(b.time) * 60_000;
      } catch {
        return 0;
      }
    })();
    return tb - ta;
  });
}

export default function CustomerReservationsPage() {
  const user = useAuthStore((s) => s.user);
  const customerId = user?._id;
  const [reservations, setReservations] = useState<CustomerReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<FilterTab>('all');

  useEffect(() => {
    if (!customerId) return;
    api
      .get<{ data: CustomerReservationItem[] }>(`/reservations/customer/${customerId}`)
      .then((res) => setReservations(res.data.data || []))
      .catch(() => setError('Randevular yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [customerId]);

  const stats = useMemo(() => {
    const upcoming = reservations.filter(isUpcomingReservation).length;
    const pending = reservations.filter((r) => r.status === 'pending').length;
    return { total: reservations.length, upcoming, pending };
  }, [reservations]);

  const filtered = useMemo(() => {
    let list = reservations;
    if (tab === 'upcoming') list = reservations.filter(isUpcomingReservation);
    if (tab === 'past') list = reservations.filter(isPastReservation);
    return sortReservations(list);
  }, [reservations, tab]);

  const handleCancel = async (id: string) => {
    const r = reservations.find((x) => x._id === id);
    if (r && isPastReservation(r)) return;
    if (!confirm('Randevuyu iptal etmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      setReservations((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'canceled' } : r)));
    } catch {
      setError('İptal edilemedi.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800/80"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-emerald-700 px-6 py-8 text-white shadow-soft sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-emerald-400/20 blur-xl" />
        <p className="text-sm font-medium text-primary-100">Randevularım</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Randevularım</h1>
        <p className="mt-2 max-w-lg text-sm text-primary-100/95">
          Tüm randevularınızı tek yerden takip edin; yaklaşan ve geçmiş kayıtları filtreleyin.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-primary-100">Toplam</p>
            <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-primary-100">Yaklaşan</p>
            <p className="text-2xl font-bold tabular-nums">{stats.upcoming}</p>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-primary-100">Onay bekleyen</p>
            <p className="text-2xl font-bold tabular-nums">{stats.pending}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {reservations.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-1.5 dark:border-neutral-700 dark:bg-neutral-900/50">
          {(
            [
              { id: 'all' as const, label: 'Tümü' },
              { id: 'upcoming' as const, label: 'Yaklaşan' },
              { id: 'past' as const, label: 'Geçmiş' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === id
                  ? 'bg-white text-primary-700 shadow-card dark:bg-neutral-800 dark:text-primary-400'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-gradient-to-b from-neutral-50 to-white px-8 py-16 text-center dark:border-neutral-600 dark:from-neutral-900/40 dark:to-neutral-900/20">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950/50">
            <ClipboardList className="h-10 w-10 text-primary-600 dark:text-primary-400" strokeWidth={1.5} aria-hidden />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-neutral-900 dark:text-white">
            Henüz randevunuz yok
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
            İşletmeleri keşfedin ve birkaç tıkla randevu oluşturun.
          </p>
          <Link href="/business" className="mt-8 inline-block">
            <Button size="lg" className="rounded-xl px-8 shadow-soft">
              İşletmelere göz at
            </Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900/30">
          <p className="text-neutral-600 dark:text-neutral-400">Bu filtrede randevu yok.</p>
          <button
            type="button"
            onClick={() => setTab('all')}
            className="mt-3 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400"
          >
            Tümünü göster
          </button>
        </div>
      ) : (
        <ul className="space-y-4 animate-fade-in">
          {filtered.map((r) => (
            <li
              key={r._id}
              className={
                isPastReservation(r)
                  ? 'pointer-events-none select-none opacity-50 grayscale'
                  : ''
              }
            >
              <CustomerReservationCard reservation={r} onCancel={handleCancel} />
            </li>
          ))}
        </ul>
      )}

      {reservations.length > 0 && (
        <div className="flex justify-center pb-4">
          <Link href="/business">
            <Button variant="outline" className="rounded-xl border-2 px-6">
              + Yeni randevu al
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

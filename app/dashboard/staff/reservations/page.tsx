'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { useStaffPanel } from '@/contexts/StaffPanelContext';
import { Card } from '@/components/ui/Card';
import {
  CustomerReservationCard,
  type CustomerReservationItem,
} from '@/components/reservations/CustomerReservationCard';

type FilterTab = 'all' | 'upcoming' | 'past';

function isUpcomingLike(r: CustomerReservationItem): boolean {
  if (r.status === 'canceled') return false;
  try {
    const raw = typeof r.date === 'string' ? r.date : String(r.date);
    const d = new Date(raw);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  } catch {
    return false;
  }
}

export default function StaffReservationsPage() {
  const { staffRows } = useStaffPanel();
  const [reservations, setReservations] = useState<CustomerReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<FilterTab>('upcoming');

  useEffect(() => {
    setLoading(true);
    api
      .get<{ data: CustomerReservationItem[] }>('/reservations/staff/mine')
      .then((res) => setReservations(res.data.data || []))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...reservations].sort((a, b) => {
      const da = typeof a.date === 'string' ? a.date : String(a.date);
      const db = typeof b.date === 'string' ? b.date : String(b.date);
      return new Date(db).getTime() - new Date(da).getTime();
    });
    if (tab === 'upcoming') return sorted.filter(isUpcomingLike);
    if (tab === 'past') return sorted.filter((r) => !isUpcomingLike(r));
    return sorted;
  }, [reservations, tab]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-8 text-white shadow-soft sm:px-10">
        <p className="text-sm font-medium text-primary-100">Personel</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">İş randevularım</h1>
        <p className="mt-2 max-w-xl text-sm text-primary-100">
          Size atanmış randevuları görüntüleyin. Onay ve iptal işlemleri işletme sahibinden yapılır.
        </p>
        {staffRows.length > 0 && (
          <p className="mt-3 max-w-xl text-xs text-primary-200/95">
            Personel kaydı:{' '}
            {staffRows
              .filter((s) => s.canViewOwnReservations)
              .map((s) => s.businessId?.name || s.name || 'İşletme')
              .filter(Boolean)
              .join(' · ') || '—'}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {!error && reservations.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600" strokeWidth={1.25} />
          <p className="mt-4 font-medium text-neutral-900 dark:text-neutral-100">
            Henüz size atanmış randevu yok
          </p>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            İşletme sahibi hesabınızı personel ile eşleştirdiğinde ve size randevu atandığında burada listelenir.
          </p>
        </Card>
      )}

      {reservations.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {(['upcoming', 'past', 'all'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === t
                    ? 'bg-primary-500 text-white shadow-soft dark:bg-primary-600'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {t === 'upcoming' ? 'Yaklaşan' : t === 'past' ? 'Geçmiş' : 'Tümü'}
              </button>
            ))}
          </div>

          <ul className="space-y-4">
            {filtered.map((r) => (
              <li key={r._id}>
                <CustomerReservationCard
                  reservation={r}
                  readOnly
                  onCancel={() => {}}
                />
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
              Bu filtreye uygun randevu yok.
            </p>
          )}
        </>
      )}
    </div>
  );
}

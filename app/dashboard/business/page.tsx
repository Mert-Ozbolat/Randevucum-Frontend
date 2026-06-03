'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, startOfDay } from 'date-fns';
import { api } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { RESERVATION_STATUS } from '@/lib/constants';

interface Business {
  _id: string;
  name: string;
  businessType: string;
}

interface SubStatus {
  isActive: boolean;
  status: string;
  endDate?: string;
}

interface Reservation {
  _id: string;
  status: string;
  date: string;
  time: string;
  serviceId?: { name: string };
  customerId?: { firstName: string; lastName: string };
}

export default function BusinessDashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [subscription, setSubscription] = useState<SubStatus | null>(null);
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const businessId = businesses[0]?._id;

  useEffect(() => {
    fetchMyBusinesses<{ data: Business[] }>()
      .then((res) => {
        const list = res.data.data || [];
        setBusinesses(list);
        const empty: [{ data: { data: SubStatus } }, { data: { data: Reservation[] } }] = [
          { data: { data: { isActive: false, status: 'Yok' } } },
          { data: { data: [] } },
        ];
        if (!list[0]) return empty;
        return Promise.all([
          api.get<{ data: SubStatus }>(`/subscription/status/${list[0]._id}`),
          api.get<{ data: Reservation[] }>(`/reservations/business/${list[0]._id}`),
        ]);
      })
      .then((results) => {
        setSubscription(results[0].data.data);
        const list = results[1].data.data || [];
        setAllReservations(list);
        const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
        setTodayReservations(
          list.filter((r: Reservation) => reservationLocalCalendarKey(String(r.date)) === todayStr)
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="max-w-2xl">
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900">İşletme bulunamadı</h2>
          <p className="mt-2 text-neutral-600">
            Randevu almaya başlamak için önce bir işletme oluşturup abone olmalısınız.
          </p>
          <Link
            href="/dashboard/business/info"
            className="mt-4 inline-block rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            İşletme Oluştur
          </Link>
        </Card>
      </div>
    );
  }

  const business = businesses[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bugünkü Randevular</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{todayReservations.length}</p>
          <Link
            href="/dashboard/business/reservations"
            className="mt-2 text-sm font-medium text-primary-600 hover:underline dark:text-primary-300"
          >
            Tümünü gör →
          </Link>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Toplam Randevular</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{allReservations.length}</p>
          <Link
            href="/dashboard/business/reservations"
            className="mt-2 text-sm font-medium text-primary-600 hover:underline dark:text-primary-300"
          >
            Takvime git →
          </Link>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Abonelik</CardTitle>
          </CardHeader>
          <p className={`text-lg font-semibold ${subscription?.isActive ? 'text-primary-600' : 'text-red-600'}`}>
            {subscription?.isActive ? 'Aktif' : subscription?.status || 'Yok'}
          </p>
          {subscription?.endDate && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Bitiş: {new Date(subscription.endDate).toLocaleDateString('tr-TR')}
            </p>
          )}
          <Link
            href="/dashboard/business/subscription"
            className="mt-2 text-sm font-medium text-primary-600 hover:underline dark:text-primary-300"
          >
            Abonelik yönetimi →
          </Link>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>İşletme</CardTitle>
          </CardHeader>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">{business.name}</p>
          <Link
            href="/dashboard/business/info"
            className="mt-2 text-sm font-medium text-primary-600 hover:underline dark:text-primary-300"
          >
            Bilgileri düzenle →
          </Link>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bugünkü randevular</CardTitle>
        </CardHeader>
        {todayReservations.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Bugün randevu yok.</p>
        ) : (
          <ul className="space-y-2">
            {todayReservations.slice(0, 5).map((r) => (
              <li
                key={r._id}
                className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-100"
              >
                <span>
                  {r.time} — {r.serviceId?.name || 'Hizmet'} —{' '}
                  {r.customerId ? `${r.customerId.firstName} ${r.customerId.lastName}` : '-'}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">{RESERVATION_STATUS[r.status] || r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

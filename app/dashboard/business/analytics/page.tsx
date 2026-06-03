'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type Business = { _id: string; name: string };

type AnalyticsResponse = {
  range: { from: string; to: string };
  currency: string;
  kpis: {
    dailyEarnings: number;
    busiestHour: string | null;
    topStaff: { staffId: string; count: number; name?: string; title?: string } | null;
    cancelRate: number;
    newCustomers: number;
    returningRate: number;
    uniqueCustomersInRange: number;
  };
  charts: {
    dailyRevenue: { date: string; amount: number }[];
  };
};

function formatTry(amount: number) {
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `₺${Math.round(amount || 0)}`;
  }
}

function percent(p: number) {
  return `${Math.round((p || 0) * 100)}%`;
}

export default function BusinessAnalyticsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyBusinesses<{ data: Business[] }>()
      .then((res) => {
        const b = (res.data.data || [])[0];
        setBusinessId(b?._id || null);
        setBusinessName(b?.name || '');
        if (!b?._id) throw new Error('no_business');
        return api.get<{ data: AnalyticsResponse }>(`/stats/business/${b._id}/analytics`);
      })
      .then((res) => setData(res.data.data))
      .catch(() => setError('Analytics yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    const rows = data?.charts?.dailyRevenue || [];
    return rows.map((r) => ({
      date: new Date(r.date).toLocaleDateString('tr-TR', { month: 'short', day: '2-digit' }),
      amount: r.amount || 0,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data || !businessId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{error || 'Veri yok.'}</p>
      </Card>
    );
  }

  const k = data.kpis;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Analytics</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {businessName ? `${businessName} • ` : ''}{data.range.from} → {data.range.to}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Günlük kazanç (bugün)</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{formatTry(k.dailyEarnings)}</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En yoğun saat</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{k.busiestHour || '—'}</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En iyi çalışan</CardTitle>
          </CardHeader>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {k.topStaff?.name || k.topStaff?.title || '—'}
          </p>
          {k.topStaff?.count ? (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{k.topStaff.count} randevu</p>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İptal oranı</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{percent(k.cancelRate)}</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yeni müşteri</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{k.newCustomers}</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tekrar gelen oranı</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{percent(k.returningRate)}</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {k.uniqueCustomersInRange} müşteri içinde
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Günlük kazanç (son 30 gün)</CardTitle>
        </CardHeader>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="date" tickMargin={8} />
              <YAxis tickFormatter={(v) => `${v}`} width={50} />
              <Tooltip formatter={(v) => formatTry(Number(v))} />
              <Line type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}


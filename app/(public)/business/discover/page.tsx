'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BusinessDiscoverFeed } from '@/components/business/BusinessDiscoverFeed';
import { type DiscoverBusiness, buildDiscoverFeed } from '@/lib/businessDiscoverMedia';

export default function BusinessDiscoverPage() {
  const [businesses, setBusinesses] = useState<DiscoverBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ data: DiscoverBusiness[] }>('/business/discover')
      .then((res) => setBusinesses(res.data.data || []))
      .catch(() => setError('Videolar yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const discoverList = useMemo(() => buildDiscoverFeed(businesses, 30), [businesses]);

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-red-300">{error}</p>
        <Link href="/business" className="text-sm text-white/70 underline">
          Geri dön
        </Link>
      </div>
    );
  }

  if (discoverList.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <p className="text-xl font-semibold">Henüz paylaşılmış video yok</p>
        <p className="max-w-sm text-sm text-neutral-400">
          İşletmeler panelden tanıtım videosu yüklediğinde burada Reels gibi görünecek.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/business"
            className="rounded-full border border-neutral-600 px-6 py-2.5 text-sm font-medium"
          >
            İşletmelere git
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold"
          >
            İşletme kaydı
          </Link>
        </div>
      </div>
    );
  }

  return <BusinessDiscoverFeed businesses={discoverList} />;
}

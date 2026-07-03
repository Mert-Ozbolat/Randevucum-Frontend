'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { BusinessDiscoverReels } from '@/components/business/BusinessDiscoverReels';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  type DiscoverBusiness,
  pickDiscoverBusinesses,
} from '@/lib/businessDiscoverMedia';

export default function BusinessDiscoverPage() {
  const [businesses, setBusinesses] = useState<DiscoverBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ data: DiscoverBusiness[] }>('/business')
      .then((res) => setBusinesses(res.data.data || []))
      .catch(() => setError('İşletmeler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const discoverList = useMemo(
    () => pickDiscoverBusinesses(businesses, 20),
    [businesses]
  );

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/business"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          İşletmelere dön
        </Link>

        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-red-800 bg-red-900/30 p-6 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && discoverList.length > 0 && (
          <div className="mt-8">
            <BusinessDiscoverReels
              businesses={discoverList}
              variant="immersive"
              showHeader
            />
          </div>
        )}

        {!loading && !error && discoverList.length === 0 && (
          <div className="mt-16 rounded-2xl border border-dashed border-neutral-700 p-12 text-center">
            <p className="text-lg font-medium text-neutral-200">Henüz keşfedilecek işletme yok</p>
            <Link
              href="/business"
              className="mt-4 inline-block rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white"
            >
              İşletmelere git
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

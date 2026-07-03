'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { BusinessDiscoverReels } from '@/components/business/BusinessDiscoverReels';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
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

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-black text-white">
      <div className="border-b border-white/10 px-4 py-4 sm:px-6">
        <Link
          href="/business"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          İşletmelere dön
        </Link>
      </div>

      {loading && (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-lg px-4 py-10">
          <div className="rounded-2xl border border-red-800 bg-red-900/30 p-6 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && discoverList.length > 0 && (
        <div className="py-6">
          <BusinessDiscoverReels
            businesses={discoverList}
            variant="immersive"
            showHeader
          />
        </div>
      )}

      {!loading && !error && discoverList.length === 0 && (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-lg font-medium text-neutral-200">Henüz paylaşılmış video yok</p>
          <p className="mt-2 text-sm text-neutral-500">
            İşletmeler panelden tanıtım videosu yüklediğinde burada Reels gibi görünecek.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/business"
              className="rounded-xl border border-neutral-600 px-5 py-2.5 text-sm font-medium text-neutral-200 transition hover:bg-neutral-900"
            >
              İşletmelere git
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600"
            >
              İşletme olarak kayıt ol
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

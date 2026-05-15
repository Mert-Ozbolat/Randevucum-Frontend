'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { useFavorites } from '@/contexts/FavoritesContext';
import { BusinessCard } from '@/components/business/BusinessCard';
import { Button } from '@/components/ui/Button';

type FavoriteBusiness = {
  _id: string;
  name: string;
  businessType: string;
  address?: { city?: string; district?: string };
  description?: string;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
};

export default function CustomerFavoritesPage() {
  const { ids, loading: idsLoading } = useFavorites();
  const [businesses, setBusinesses] = useState<FavoriteBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<{ data: FavoriteBusiness[] }>('/favorites/me')
      .then((res) => {
        if (!cancelled) setBusinesses(res.data.data || []);
      })
      .catch(() => {
        if (!cancelled) {
          setBusinesses([]);
          setError('Favoriler yüklenemedi.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => businesses.filter((b) => ids.has(String(b._id))),
    [businesses, ids]
  );

  const busy = loading || idsLoading;

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
            <Heart className="h-6 w-6 text-red-500" strokeWidth={2} aria-hidden />
            Favorilerim
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Sık kullandığınız işletmelere hızlıca randevu alın.
          </p>
        </div>
        <Link href="/business" className="shrink-0">
          <Button variant="outline" size="sm">
            İşletme keşfet
          </Button>
        </Link>
      </div>

      {busy && (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      )}

      {!busy && error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      {!busy && !error && visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center dark:border-neutral-600 dark:bg-neutral-800">
          <Heart className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 font-medium text-neutral-800 dark:text-neutral-200">Henüz favori işletmeniz yok</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            İşletme kartlarındaki kalp simgesine dokunarak favorilere ekleyebilirsiniz.
          </p>
          <Link href="/business" className="mt-6 inline-block">
            <Button>İşletmelere göz at</Button>
          </Link>
        </div>
      )}

      {!busy && !error && visible.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((b) => (
            <BusinessCard
              key={b._id}
              _id={b._id}
              name={b.name}
              businessType={b.businessType}
              address={b.address}
              description={b.description}
              imageUrl={b.imageUrl}
              rating={b.rating}
              reviewCount={b.reviewCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

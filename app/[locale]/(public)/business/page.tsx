'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { BUSINESS_TYPES, KKTC_CITIES } from '@/lib/constants';
import { BUSINESS_TYPE_LABELS } from '@/lib/businessCategories';
import { BusinessCard } from '@/components/business/BusinessCard';
import { BusinessDiscoverSection } from '@/components/business/BusinessDiscoverSection';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

interface Business {
  _id: string;
  name: string;
  businessType: string;
  area?: string;
  profession?: string;
  address?: { city?: string; district?: string };
  phone?: string;
  description?: string;
  imageUrl?: string | null;
  averageRating?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  promoVideoUrl?: string | null;
  promoVideoCaption?: string | null;
  createdAt?: string;
}

type SortOption = 'default' | 'rating' | 'nearest' | 'today';

function BusinessListPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || '';
  const areaFilter = searchParams.get('area') || '';
  const professionFilter = searchParams.get('profession') || '';
  const cityParam = searchParams.get('city') || '';
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [locationFilter, setLocationFilter] = useState(cityParam);
  const [todayOnly, setTodayOnly] = useState(false);

  useEffect(() => {
    setLocationFilter(cityParam);
  }, [cityParam]);

  useEffect(() => {
    const shouldUseAreaProfession = !!areaFilter || !!professionFilter;
    const request = shouldUseAreaProfession
      ? api.get<{ data: Business[] }>('/api/businesses', {
          params: {
            area: areaFilter || undefined,
            profession: professionFilter || undefined,
          },
        })
      : api.get<{ data: Business[] }>('/business', {
          params: type ? { businessType: type } : {},
        });

    request
      .then((res) => setBusinesses(res.data.data || []))
      .catch(() => setError('İşletmeler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [type, areaFilter, professionFilter]);

  const filteredAndSorted = useMemo(() => {
    let list = [...businesses];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          ((BUSINESS_TYPE_LABELS[b.businessType] || BUSINESS_TYPES[b.businessType] || '')).toLowerCase().includes(q) ||
          b.address?.city?.toLowerCase().includes(q) ||
          b.address?.district?.toLowerCase().includes(q)
      );
    }
    if (areaFilter) {
      list = list.filter((b) => b.area === areaFilter || (b as any).mainCategory === areaFilter);
    }
    if (professionFilter) {
      list = list.filter(
        (b) => b.profession === professionFilter || (b as any).subCategory === professionFilter
      );
    }
    if (locationFilter.trim()) {
      const selectedCity = locationFilter.trim();
      list = list.filter(
        (b) =>
          b.address?.city?.trim() === selectedCity ||
          b.address?.district?.trim() === selectedCity
      );
    }
    if (todayOnly) {
      const day = new Date().getDay();
      list = list.filter((b) => {
        const wh = (b as unknown as { workingHours?: { dayOfWeek: number; isClosed?: boolean }[] }).workingHours;
        if (!wh?.length) return true;
        const today = wh.find((h) => h.dayOfWeek === day);
        return today && !today.isClosed;
      });
    }
    if (sortBy === 'rating') {
      list.sort(
        (a, b) =>
          (b.averageRating ?? b.rating ?? 0) - (a.averageRating ?? a.rating ?? 0)
      );
    }
    if (sortBy === 'nearest') {
      const cities = [...new Set(list.map((b) => b.address?.city).filter(Boolean))];
      list.sort((a, b) => {
        const ac = (a.address?.city || '').toLowerCase();
        const bc = (b.address?.city || '').toLowerCase();
        return ac.localeCompare(bc);
      });
    }
    return list;
  }, [businesses, searchQuery, locationFilter, todayOnly, sortBy, areaFilter, professionFilter]);

  const DISCOVER_AFTER = 6;
  const listBeforeDiscover = filteredAndSorted.slice(0, DISCOVER_AFTER);
  const listAfterDiscover = filteredAndSorted.slice(DISCOVER_AFTER);
  const hasDiscoverVideos = filteredAndSorted.some((b) => Boolean(b.promoVideoUrl?.trim()));
  const showDiscoverSection =
    !loading && !error && filteredAndSorted.length > 0 && hasDiscoverVideos;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-50">İşletmeler</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Arayın, filtreleyin — en yakındaki ve en iyi işletmeyi bulun.
      </p>

      {/* Arama + Filtre */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            placeholder="İşletme ara…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-neutral-800 shadow-card transition placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700 shadow-card transition focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
            title="Konuma göre filtre"
          >
            <option value="">Tüm konumlar</option>
            {KKTC_CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700 shadow-card transition focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
            title="Sırala"
          >
            <option value="default">Sıralama</option>
            <option value="rating">Puana göre</option>
            <option value="nearest">Şehre göre (A–Z)</option>
          </select>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700 shadow-card transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
            <input
              type="checkbox"
              checked={todayOnly}
              onChange={(e) => setTodayOnly(e.target.checked)}
              className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
            />
            <Clock className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={2} aria-hidden />
            <span>Bugün müsait</span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/business"
          className={`rounded-xl px-4 py-2.5 text-sm font-medium shadow-card transition ${
            !type
              ? 'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700'
              : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700'
          }`}
        >
          Tümü
        </Link>
        {Object.entries(BUSINESS_TYPES).map(([key, label]) => (
          <Link
            key={key}
            href={`/business?type=${key}`}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium shadow-card transition ${
              type === key
                ? 'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700'
                : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {loading && (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-card dark:border-red-800 dark:bg-red-900/20">
          <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-medium text-red-600 underline hover:no-underline"
          >
            Tekrar dene
          </button>
        </div>
      )}

      {!loading && !error && businesses.length > 0 && (
        <>
          {filteredAndSorted.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-12 text-center shadow-card dark:border-neutral-600 dark:bg-neutral-800/50">
              <p className="text-neutral-600 dark:text-neutral-300">Arama veya filtreye uygun işletme bulunamadı.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setLocationFilter(''); setTodayOnly(false); setSortBy('default'); }}
                className="mt-4 inline-block rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-600"
              >
                Filtreleri temizle
              </button>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {listBeforeDiscover.map((b) => (
                <BusinessCard
                  key={b._id}
                  _id={b._id}
                  name={b.name}
                  businessType={b.businessType}
                  address={b.address}
                  description={b.description}
                  imageUrl={b.imageUrl}
                  rating={b.averageRating ?? b.rating}
                  reviewCount={b.reviewCount}
                  isPopular={
                    (b.averageRating ?? b.rating ?? 0) >= 4.5 && (b.reviewCount ?? 0) > 0
                  }
                  isNew={b.createdAt ? new Date(b.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false}
                />
              ))}
              {showDiscoverSection && (
                <BusinessDiscoverSection businesses={filteredAndSorted} />
              )}
              {listAfterDiscover.map((b) => (
                <BusinessCard
                  key={b._id}
                  _id={b._id}
                  name={b.name}
                  businessType={b.businessType}
                  address={b.address}
                  description={b.description}
                  imageUrl={b.imageUrl}
                  rating={b.averageRating ?? b.rating}
                  reviewCount={b.reviewCount}
                  isPopular={
                    (b.averageRating ?? b.rating ?? 0) >= 4.5 && (b.reviewCount ?? 0) > 0
                  }
                  isNew={b.createdAt ? new Date(b.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !error && businesses.length === 0 && (
        <div className="mt-16 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-12 text-center shadow-card dark:border-neutral-600 dark:bg-neutral-800/50">
          <p className="text-lg font-medium text-neutral-700 dark:text-neutral-200">Henüz işletme bulunmuyor</p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Bu kategoride kayıtlı işletme yok. Tümünü görüntüleyin veya daha sonra tekrar deneyin.
          </p>
          <Link
            href="/business"
            className="mt-4 inline-block rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-600"
          >
            Tüm kategoriler
          </Link>
        </div>
      )}
    </div>
  );
}

export default BusinessListPage;

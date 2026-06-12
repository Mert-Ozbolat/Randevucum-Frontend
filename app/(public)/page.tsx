'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Check, Search, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { HOME_FEATURED_AREAS } from '@/lib/homeFeaturedAreas';
import {
  HOME_PLATFORM_SLIDES,
  mapPaidSliderAdsToSlides,
  mergeHeroSlides,
  type PaidSliderAdApi,
} from '@/lib/homeHeroSlides';
import { HeroPromoCarousel } from '@/components/home/HeroPromoCarousel';
import { HomeLiveStats } from '@/components/home/HomeLiveStats';
import { HomeBottomSections } from '@/components/home/HomeBottomSections';
import { BusinessCard } from '@/components/business/BusinessCard';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

interface Business {
  _id: string;
  name: string;
  businessType: string;
  address?: { city?: string; district?: string };
  description?: string;
  imageUrl?: string | null;
  averageRating?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  createdAt?: string;
}

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [paidSliderAds, setPaidSliderAds] = useState<PaidSliderAdApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ data: Business[] }>('/business')
      .then((res) => setBusinesses(res.data.data || []))
      .catch(() => setError(''))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get<{ data: PaidSliderAdApi[] }>('/business/home-slider-ads')
      .then((res) => setPaidSliderAds(res.data.data || []))
      .catch(() => setPaidSliderAds([]));
  }, []);

  const featuredBusinesses = useMemo(
    () =>
      [...businesses]
        .sort(
          (a, b) =>
            (b.averageRating ?? b.rating ?? 0) - (a.averageRating ?? a.rating ?? 0)
        )
        .slice(0, 6),
    [businesses]
  );

  const heroSlides = useMemo(
    () => mergeHeroSlides(HOME_PLATFORM_SLIDES, mapPaidSliderAdsToSlides(paidSliderAds)),
    [paidSliderAds]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      {/* Hero — metin + görsel */}
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_min(42%,520px)] lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Online randevu
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
            Dakikalar içinde randevu alın
          </h1>
          <p className="mt-4 max-w-xl text-lg text-neutral-600 dark:text-neutral-300">
            Kuaförden kliniğe, tek yerden müsait saatleri görün ve randevunuzu oluşturun.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-primary-500 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:bg-primary-600 active:scale-[0.98]"
            >
              Ücretsiz başlayın
            </Link>
            <Link
              href="/business"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-neutral-200 bg-white/80 px-6 py-3.5 text-base font-semibold text-neutral-800 backdrop-blur-sm transition hover:border-primary-400 hover:bg-white dark:border-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-100 dark:hover:border-primary-500"
            >
              İşletmeleri keşfet
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {['Hızlı randevu', 'Ücretsiz kullanım', 'Onaylı işletmeler'].map((label) => (
              <li key={label} className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                  aria-hidden
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <HomeLiveStats />
        </div>
        <HeroPromoCarousel slides={heroSlides} />
      </section>

      {/* Öne çıkan alanlar — sadece 6 görsel kart */}
      <section className="mt-20 lg:mt-28">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              Neye ihtiyacınız var?
            </h2>
            <p className="mt-1 max-w-lg text-neutral-600 dark:text-neutral-400">
              En sık aranan alanlar; tüm kategoriler listesine işletmeler sayfasından ulaşabilirsiniz.
            </p>
          </div>
          <Link
            href="/business"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary-600 transition hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Tüm kategoriler
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_FEATURED_AREAS.map((area) => (
            <Link
              key={area.name}
              href={`/business?area=${encodeURIComponent(area.name)}`}
              className="group relative isolate overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-soft dark:ring-white/10"
            >
              <div className="relative aspect-[16/11] w-full">
                <Image
                  src={area.image}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                  aria-hidden
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="text-xs font-medium text-white/80">{area.tagline}</p>
                <p className="mt-0.5 flex items-center justify-between gap-2 text-lg font-bold text-white">
                  <span>{area.name}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition group-hover:bg-white/30">
                    <ArrowRight className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden />
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tek işletme bloğu */}
      <section className="mt-20 lg:mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
              Öne çıkan işletmeler
            </h2>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              Puana göre sıralı; platformdaki tüm işletmeleri keşfedin.
            </p>
          </div>
          <Link
            href="/business"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400"
          >
            Tümünü gör
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
        {loading && (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {!loading && !error && businesses.length > 0 && (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBusinesses.map((b) => (
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
                isNew={
                  !!b.createdAt && new Date(b.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
              />
            ))}
          </div>
        )}
        {!loading && !error && businesses.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-12 text-center dark:border-neutral-600 dark:bg-neutral-800/40">
            <p className="text-neutral-600 dark:text-neutral-300">Henüz işletme eklenmemiş.</p>
            <Link
              href="/business"
              className="mt-4 inline-block rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-600"
            >
              İşletmeler
            </Link>
          </div>
        )}
      </section>

      {/* Nasıl çalışır — sıkı */}
      <section className="mt-16 rounded-3xl border border-primary-200/40 bg-gradient-to-br from-primary-500/[0.06] via-white to-amber-50/40 px-6 py-10 dark:border-primary-900/40 dark:from-primary-950/30 dark:via-neutral-900 dark:to-amber-950/20 sm:px-10 lg:mt-20">
        <h2 className="text-center text-xl font-bold text-neutral-900 dark:text-neutral-50 sm:text-2xl">
          Nasıl çalışır?
        </h2>
        <p className="mx-auto mt-1 max-w-md text-center text-sm text-neutral-600 dark:text-neutral-400">
          Üç kısa adım.
        </p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'İşletme seçin',
              text: 'Alan veya konuma göre arayın.',
              Icon: Search,
            },
            {
              step: '2',
              title: 'Saat seçin',
              text: 'Hizmeti ve müsait saati onaylayın.',
              Icon: Calendar,
            },
            {
              step: '3',
              title: 'Hazırsınız',
              text: 'Randevunuz kaydedilir; bildirim alırsınız.',
              Icon: Check,
            },
          ].map(({ step, title, text, Icon }) => (
            <div key={step} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-md dark:bg-primary-600">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <span className="mt-3 text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                Adım {step}
              </span>
              <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-50">{title}</h3>
              <p className="mt-1 max-w-[14rem] text-xs text-neutral-600 dark:text-neutral-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <HomeBottomSections />
    </div>
  );
}

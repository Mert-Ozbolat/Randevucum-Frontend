'use client';

import { useTranslations } from 'next-intl';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { BusinessCard } from '@/components/business/BusinessCard';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';
import { Link } from '@/i18n/navigation';

export interface HomeBusiness {
  _id: string;
  name: string;
  businessType: string;
  area?: string;
  mainCategory?: string;
  profession?: string;
  address?: { city?: string; district?: string };
  description?: string;
  imageUrl?: string | null;
  averageRating?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  createdAt?: string;
  isAvailableToday?: boolean;
  location?: { lat?: number; lng?: number } | null;
}

interface Props {
  businesses: HomeBusiness[];
  loading: boolean;
  error: boolean;
}

function sortByHighestRating(list: HomeBusiness[]): HomeBusiness[] {
  return [...list].sort((a, b) => {
    const ra = a.averageRating ?? a.rating ?? 0;
    const rb = b.averageRating ?? b.rating ?? 0;
    if (rb !== ra) return rb - ra;
    return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
  });
}

export function HomeFeaturedBusinesses({ businesses, loading, error }: Props) {
  const t = useTranslations('home.featured');
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const featured = sortByHighestRating(
    businesses.filter((b) => (b.averageRating ?? b.rating ?? 0) > 0)
  ).slice(0, 6);

  return (
    <AnimateIn as="section" animation="slide-up">
      <HomeSectionHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        href="/business"
        linkLabel={tCommon('seeAll')}
      />

      {loading && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-200">{tHome('errors.businessesLoadFailed')}</p>
        </div>
      )}

      {!loading && !error && featured.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((b, i) => (
            <AnimateIn key={b._id} animation="slide-up" delay={i * 60}>
              <BusinessCard
                _id={b._id}
                name={b.name}
                businessType={b.businessType}
                address={b.address}
                description={b.description}
                imageUrl={b.imageUrl}
                rating={b.averageRating ?? b.rating}
                reviewCount={b.reviewCount}
                isPopular={(b.averageRating ?? b.rating ?? 0) >= 4.5}
                isAvailableToday={b.isAvailableToday}
                isNew={
                  !!b.createdAt &&
                  new Date(b.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
              />
            </AnimateIn>
          ))}
        </div>
      )}

      {!loading && !error && featured.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 bg-white px-8 py-14 text-center dark:border-neutral-600 dark:bg-neutral-800/40">
          <p className="text-neutral-600 dark:text-neutral-300">{t('empty')}</p>
          <Link
            href="/business"
            className="mt-5 inline-flex rounded-2xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600"
          >
            {tHome('exploreBusinesses')}
          </Link>
        </div>
      )}
    </AnimateIn>
  );
}

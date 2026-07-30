'use client';

import { useTranslations } from 'next-intl';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { BusinessCard } from '@/components/business/BusinessCard';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';
import type { HomeBusiness } from '@/components/home/HomeFeaturedBusinesses';
import { Link } from '@/i18n/navigation';

interface Props {
  businesses: HomeBusiness[];
  loading: boolean;
}

function sortByNewest(list: HomeBusiness[]): HomeBusiness[] {
  return [...list].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

export function HomeNewestBusinesses({ businesses, loading }: Props) {
  const t = useTranslations('home.newest');
  const tCommon = useTranslations('common');
  const newest = sortByNewest(businesses).slice(0, 6);

  if (!loading && newest.length === 0) return null;

  return (
    <AnimateIn as="section" animation="slide-up">
      <HomeSectionHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        href="/business"
        linkLabel={tCommon('seeAll')}
      />

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newest.map((b, i) => (
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
                isNew
              />
            </AnimateIn>
          ))}
        </div>
      )}

      {!loading && (
        <div className="mt-8 text-center">
          <Link
            href="/business"
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-primary-300"
          >
            {t('more')}
          </Link>
        </div>
      )}
    </AnimateIn>
  );
}

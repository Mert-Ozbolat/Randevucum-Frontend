'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';
import {
  HOME_POPULAR_CATEGORIES,
  countBusinessesForCategory,
} from '@/lib/homePopularCategories';
import type { HomeBusiness } from '@/components/home/HomeFeaturedBusinesses';
import { Link } from '@/i18n/navigation';

interface Props {
  businesses: HomeBusiness[];
  loading?: boolean;
}

export function HomePopularCategories({ businesses, loading = false }: Props) {
  const t = useTranslations('home.popularCategories');
  const tHome = useTranslations('home');

  return (
    <AnimateIn
      as="section"
      animation="slide-up"
      className="relative z-0"
      aria-labelledby="home-categories-title"
    >
      <HomeSectionHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        href="/business"
        linkLabel={t('linkLabel')}
        titleId="home-categories-title"
      />

      <div className="mt-8 sm:hidden">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {HOME_POPULAR_CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            const count = countBusinessesForCategory(cat, businesses);
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="snap-start flex w-[112px] shrink-0 flex-col items-center rounded-2xl border border-neutral-200 bg-white px-3 py-4 text-center transition active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-primary-500">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="mt-3 text-sm font-semibold text-neutral-900 dark:text-white">
                  {t(`items.${cat.id}.name`)}
                </span>
                <span className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  {loading ? '…' : `${count}`}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-8 hidden overflow-hidden rounded-3xl border border-neutral-200/90 bg-white dark:border-neutral-700 dark:bg-neutral-900 sm:block">
        <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 sm:grid sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-2 xl:grid-cols-2">
          {HOME_POPULAR_CATEGORIES.map((cat, i) => {
            const Icon = cat.Icon;
            const count = countBusinessesForCategory(cat, businesses);
            const isLastOdd =
              HOME_POPULAR_CATEGORIES.length % 2 === 1 &&
              i === HOME_POPULAR_CATEGORIES.length - 1;

            return (
              <li
                key={cat.id}
                className={`border-neutral-100 dark:border-neutral-800 ${
                  i % 2 === 0 ? 'sm:border-r' : ''
                } ${i < HOME_POPULAR_CATEGORIES.length - 2 ? 'sm:border-b' : ''} ${
                  isLastOdd ? 'sm:col-span-2 sm:border-b-0' : ''
                }`}
              >
                <Link
                  href={cat.href}
                  className="group flex items-center gap-4 px-5 py-4 transition hover:bg-primary-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:hover:bg-primary-950/30 sm:px-6 sm:py-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 transition group-hover:bg-primary-500 group-hover:text-white dark:bg-neutral-800 dark:text-neutral-100">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-base font-semibold text-neutral-900 dark:text-white">
                        {t(`items.${cat.id}.name`)}
                      </span>
                      <span className="hidden text-xs text-neutral-400 sm:inline dark:text-neutral-500">
                        · {t(`items.${cat.id}.hint`)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm text-neutral-500 dark:text-neutral-400">
                      {loading ? '…' : tHome('businessCount', { count })}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600 dark:text-neutral-600 dark:group-hover:text-primary-400"
                    strokeWidth={2}
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </AnimateIn>
  );
}

'use client';

import { useMemo } from 'react';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { BusinessDiscoverReels } from '@/components/business/BusinessDiscoverReels';
import {
  type DiscoverBusiness,
  getLatestDiscoverVideos,
} from '@/lib/businessDiscoverMedia';

interface BusinessDiscoverSectionProps {
  businesses: DiscoverBusiness[];
}

/** İşletmeler listesinde kaydırınca görünen video keşfet şeridi (sadece yüklenmiş videolar) */
export function BusinessDiscoverSection({ businesses }: BusinessDiscoverSectionProps) {
  const discoverList = useMemo(() => getLatestDiscoverVideos(businesses, 5), [businesses]);

  if (discoverList.length < 1) return null;

  return (
    <AnimateIn animation="slide-in-right" className="col-span-full">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-900 via-neutral-900 to-primary-950/40 p-5 shadow-card sm:p-8 dark:border-neutral-700">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl"
          aria-hidden
        />
        <BusinessDiscoverReels
          businesses={discoverList}
          variant="embedded"
          showHeader
        />
      </div>
    </AnimateIn>
  );
}

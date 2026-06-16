'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import {
  HOME_PLATFORM_SLIDES,
  mapPaidSliderAdsToSlides,
  mergeHeroSlides,
  type PaidSliderAdApi,
} from '@/lib/homeHeroSlides';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeCategoriesBento } from '@/components/home/HomeCategoriesBento';
import { HomeFeaturedBusinesses, type HomeBusiness } from '@/components/home/HomeFeaturedBusinesses';
import { HomeHowItWorks } from '@/components/home/HomeHowItWorks';
import { HomeBottomSections } from '@/components/home/HomeBottomSections';

export default function HomePage() {
  const [businesses, setBusinesses] = useState<HomeBusiness[]>([]);
  const [paidSliderAds, setPaidSliderAds] = useState<PaidSliderAdApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get<{ data: HomeBusiness[] }>('/business')
      .then((res) => setBusinesses(res.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get<{ data: PaidSliderAdApi[] }>('/business/home-slider-ads')
      .then((res) => setPaidSliderAds(res.data.data || []))
      .catch(() => setPaidSliderAds([]));
  }, []);

  const heroSlides = useMemo(
    () => mergeHeroSlides(HOME_PLATFORM_SLIDES, mapPaidSliderAdsToSlides(paidSliderAds)),
    [paidSliderAds]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <HomeHero slides={heroSlides} />

      <div className="space-y-20 lg:space-y-28">
        <HomeCategoriesBento />
        <HomeFeaturedBusinesses businesses={businesses} loading={loading} error={error} />
        <HomeHowItWorks />
        <HomeBottomSections />
      </div>
    </div>
  );
}

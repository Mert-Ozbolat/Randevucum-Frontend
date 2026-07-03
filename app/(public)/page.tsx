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
import { HomeDiscoverVideos } from '@/components/home/HomeDiscoverVideos';
import { HomeHowItWorks } from '@/components/home/HomeHowItWorks';
import { HomeBottomSections } from '@/components/home/HomeBottomSections';

export default function HomePage() {
  const [featuredBusinesses, setFeaturedBusinesses] = useState<HomeBusiness[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(false);
  const [paidSliderAds, setPaidSliderAds] = useState<PaidSliderAdApi[]>([]);

  useEffect(() => {
    api
      .get<{ data: HomeBusiness[] }>('/business', {
        params: { sort: 'rating', limit: 6 },
      })
      .then((res) => setFeaturedBusinesses(res.data.data || []))
      .catch(() => setFeaturedError(true))
      .finally(() => setFeaturedLoading(false));
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
        <HomeDiscoverVideos />
        <HomeFeaturedBusinesses
          businesses={featuredBusinesses}
          loading={featuredLoading}
          error={featuredError}
        />
        <HomeHowItWorks />
        <HomeBottomSections />
      </div>
    </div>
  );
}

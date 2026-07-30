"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSearchBar } from "@/components/home/HomeSearchBar";
import { HomePopularCategories } from "@/components/home/HomePopularCategories";
import { HomeNearbyBusinesses } from "@/components/home/HomeNearbyBusinesses";
import {
  HomeFeaturedBusinesses,
  type HomeBusiness,
} from "@/components/home/HomeFeaturedBusinesses";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeWhatWeOffer } from "@/components/home/HomeWhatWeOffer";
import { HomeNewestBusinesses } from "@/components/home/HomeNewestBusinesses";
import { HomeTestimonials } from "@/components/home/HomeTestimonials";
import { HomePricing } from "@/components/home/HomePricing";
import { HomeBusinessOwnerCta } from "@/components/home/HomeBusinessOwnerCta";

export default function HomePage() {
  const [businesses, setBusinesses] = useState<HomeBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ data: HomeBusiness[] }>("/business")
      .then((res) => {
        if (!cancelled) setBusinesses(res.data.data || []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="overflow-x-hidden pb-0">
      <HomeHero />

      <div className="relative z-0 mx-auto mt-8 max-w-7xl space-y-16 px-4 sm:px-6 lg:mt-12 lg:space-y-28 lg:px-8">
        <HomeSearchBar />
        <div className="relative z-0 min-w-0 space-y-16 pb-16 lg:space-y-28 lg:pb-28">
          <HomePopularCategories businesses={businesses} loading={loading} />
          <HomeNearbyBusinesses
            businesses={businesses}
            loading={loading}
            error={error}
          />
          <HomeFeaturedBusinesses
            businesses={businesses}
            loading={loading}
            error={error}
          />
          <HomeHowItWorks />
          <HomeWhatWeOffer />
          <HomeNewestBusinesses businesses={businesses} loading={loading} />
          <HomeTestimonials />
          <HomePricing />
        </div>
      </div>

      <HomeBusinessOwnerCta />
    </div>
  );
}

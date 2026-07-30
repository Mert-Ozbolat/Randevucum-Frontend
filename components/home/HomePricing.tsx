'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';
import { PricingPlanCards } from '@/components/pricing/PricingPlanCards';
import { usePricingPlans } from '@/hooks/usePricingPlans';

export function HomePricing() {
  const { plans, trialDays, loading } = usePricingPlans();

  return (
    <AnimateIn as="section" animation="slide-up" aria-labelledby="home-pricing-title">
      <HomeSectionHeader
        eyebrow="Paketler"
        title="İşletmeniz için şeffaf fiyatlandırma"
        description={`${trialDays} gün ücretsiz deneyin. Aylık, 3 aylık veya yıllık — hepsi aynı özellikler.`}
        align="center"
        titleSize="large"
        titleId="home-pricing-title"
      />

      {loading ? (
        <div className="mt-10 flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="mt-10">
          <PricingPlanCards plans={plans} compact />
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-primary-300"
        >
          Tüm detayları gör
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </Link>
      </div>
    </AnimateIn>
  );
}

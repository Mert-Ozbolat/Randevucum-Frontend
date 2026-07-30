'use client';

import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { PLAN_FEATURES } from '@/lib/subscriptionTrial';
import {
  formatTry,
  isCheckoutPlan,
  monthlyEquivalent,
  planBadge,
  planDescription,
  savingsPercent,
  type PublicPlan,
} from '@/lib/pricing';

export type PricingPlanCardsProps = {
  plans: PublicPlan[];
  trialActive?: boolean;
  isOwner?: boolean;
  checkoutLoadingPriceId?: string | null;
  onCheckout?: (priceId: string) => void;
  compact?: boolean;
};

export function PricingPlanCards({
  plans,
  trialActive = false,
  isOwner = false,
  checkoutLoadingPriceId = null,
  onCheckout,
  compact = false,
}: PricingPlanCardsProps) {
  return (
    <div className={`grid gap-6 ${compact ? 'md:grid-cols-3' : 'gap-8 lg:grid-cols-3'}`}>
      {plans.map((plan) => {
        const badge = planBadge(plan);
        const highlighted = plan.billingPeriod === 'quarterly';
        const equiv = monthlyEquivalent(plan);
        const savings = savingsPercent(plan);
        const canCheckout = isCheckoutPlan(plan) && onCheckout && isOwner && !trialActive;

        return (
          <article
            key={plan.priceId}
            className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-card transition duration-300 dark:bg-neutral-900/80 ${
              highlighted
                ? 'border-primary-400 ring-2 ring-primary-500/80 shadow-soft dark:border-primary-600'
                : 'border-neutral-200 hover:-translate-y-0.5 hover:shadow-soft dark:border-neutral-700'
            }`}
          >
            {badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {badge}
              </span>
            )}

            <div className="mb-5">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{plan.label}</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{planDescription(plan)}</p>

              <p className="mt-4 text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                {plan.displayPrice ?? '—'}
                {plan.displayPrice && (
                  <span className="text-base font-medium text-neutral-500 dark:text-neutral-400">
                    /{plan.intervalLabel || 'ay'}
                  </span>
                )}
              </p>

              {equiv != null && savings != null && savings > 0 && (
                <p className="mt-2 text-sm font-medium text-primary-700 dark:text-primary-300">
                  Aylık ~{formatTry(equiv)} · %{savings} tasarruf
                </p>
              )}

              {trialActive && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 dark:text-primary-300">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Deneme süresince ücretsiz
                </p>
              )}
            </div>

            {!compact && (
              <ul className="mb-6 flex-1 space-y-2.5 border-t border-neutral-100 pt-5 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-200">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" strokeWidth={2.5} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {compact && <div className="flex-1" />}

            {trialActive ? (
              <p
                className="mt-auto cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-100 py-3 text-center text-sm font-semibold text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                title="Deneme süresince satın alma kapalı"
              >
                Deneme süresinde
              </p>
            ) : canCheckout ? (
              <button
                type="button"
                disabled={Boolean(checkoutLoadingPriceId)}
                onClick={() => onCheckout(plan.priceId)}
                className={`mt-auto w-full rounded-xl py-3 text-sm font-semibold transition ${
                  highlighted
                    ? 'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60'
                    : 'border-2 border-neutral-200 bg-white text-neutral-800 hover:border-primary-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100'
                }`}
              >
                {checkoutLoadingPriceId === plan.priceId ? 'Yönlendiriliyor…' : 'Aboneliği başlat'}
              </button>
            ) : isOwner ? (
              <Link
                href="/dashboard/business/subscription"
                className={`mt-auto block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                  highlighted
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'border-2 border-neutral-200 bg-white text-neutral-800 hover:border-primary-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100'
                }`}
              >
                Aboneliğe git
              </Link>
            ) : (
              <Link
                href="/register?type=business_owner&from=/pricing"
                className={`mt-auto block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                  highlighted
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'border-2 border-neutral-200 bg-white text-neutral-800 hover:border-primary-400 dark:border-neutral-600 dark:bg-neutral-900'
                }`}
              >
                Ücretsiz başla
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function PricingFeaturesPanel() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900/50 sm:p-8">
      <h3 className="text-center text-lg font-bold text-neutral-900 dark:text-neutral-50">
        Tüm paketlerde dahil
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-neutral-600 dark:text-neutral-400">
        Aylık, 3 aylık veya yıllık seçin — özellik seti aynıdır.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {PLAN_FEATURES.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm dark:bg-neutral-800 dark:text-neutral-200"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" strokeWidth={2.5} aria-hidden />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

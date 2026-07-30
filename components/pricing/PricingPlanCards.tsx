'use client';

import Link from 'next/link';
import {
  Bell,
  Calendar,
  CalendarClock,
  CalendarRange,
  Check,
  Headphones,
  MessageCircle,
  Sparkles,
  Users,
  Video,
  Zap,
} from 'lucide-react';
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

const PLAN_ICONS = {
  monthly: Calendar,
  quarterly: CalendarRange,
  yearly: CalendarClock,
} as const;

function PlanIcon({ period }: { period?: PublicPlan['billingPeriod'] }) {
  const Icon =
    period === 'yearly'
      ? PLAN_ICONS.yearly
      : period === 'quarterly'
        ? PLAN_ICONS.quarterly
        : PLAN_ICONS.monthly;
  return <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />;
}

export type PricingPlanCardsProps = {
  plans: PublicPlan[];
  trialActive?: boolean;
  isOwner?: boolean;
  checkoutLoadingPriceId?: string | null;
  onCheckout?: (priceId: string) => void;
  compact?: boolean;
  showcase?: boolean;
};

export function PricingPlanCards({
  plans,
  trialActive = false,
  isOwner = false,
  checkoutLoadingPriceId = null,
  onCheckout,
  compact = false,
  showcase = false,
}: PricingPlanCardsProps) {
  const showFeatures = !compact && !showcase;

  return (
    <div
      className={
        showcase
          ? 'grid items-stretch gap-6 lg:grid-cols-3 lg:gap-5 lg:items-center'
          : `grid gap-6 ${compact ? 'md:grid-cols-3' : 'gap-8 lg:grid-cols-3'}`
      }
    >
      {plans.map((plan) => {
        const badge = planBadge(plan);
        const highlighted = plan.billingPeriod === 'quarterly';
        const equiv = monthlyEquivalent(plan);
        const savings = savingsPercent(plan);
        const canCheckout = isCheckoutPlan(plan) && onCheckout && isOwner && !trialActive;

        const ctaClass = highlighted
          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-400'
          : showcase
            ? 'border border-neutral-200/80 bg-white/80 text-neutral-900 backdrop-blur-sm hover:border-primary-300 hover:bg-white dark:border-neutral-600 dark:bg-neutral-900/80 dark:text-white dark:hover:border-primary-500'
            : 'border-2 border-neutral-200 bg-white text-neutral-800 hover:border-primary-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100';

        return (
          <article
            key={plan.priceId}
            className={`relative flex flex-col transition duration-500 ${
              showcase
                ? highlighted
                  ? 'z-10 lg:-my-4 lg:scale-[1.04]'
                  : 'lg:mt-2'
                : ''
            } ${
              showcase
                ? highlighted
                  ? 'rounded-[2rem] border border-primary-400/50 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 p-[1px] shadow-2xl shadow-primary-500/20'
                  : 'rounded-[1.75rem] border border-neutral-200/70 bg-white/60 p-px backdrop-blur-xl dark:border-neutral-700/70 dark:bg-neutral-900/40'
                : `rounded-3xl border bg-white p-6 shadow-card dark:bg-neutral-900/80 ${
                    highlighted
                      ? 'border-primary-400 ring-2 ring-primary-500/80 shadow-soft dark:border-primary-600'
                      : 'border-neutral-200 hover:-translate-y-0.5 hover:shadow-soft dark:border-neutral-700'
                  }`
            }`}
          >
            <div
              className={`flex h-full flex-col ${
                showcase
                  ? highlighted
                    ? 'rounded-[calc(2rem-1px)] bg-neutral-900 px-7 py-8 text-white'
                    : 'rounded-[calc(1.75rem-1px)] bg-white/90 px-6 py-7 dark:bg-neutral-950/90'
                  : ''
              }`}
            >
              {badge && (
                <span
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-wider shadow-md ${
                    highlighted
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-900 text-white dark:bg-primary-500'
                  }`}
                >
                  {badge}
                </span>
              )}

              <div className={showcase ? 'mb-6' : 'mb-5'}>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      highlighted && showcase
                        ? 'bg-primary-500/20 text-primary-300 ring-1 ring-primary-400/30'
                        : 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-300'
                    }`}
                  >
                    <PlanIcon period={plan.billingPeriod} />
                  </span>
                  <div>
                    <h3
                      className={`text-lg font-bold ${
                        highlighted && showcase
                          ? 'text-white'
                          : 'text-neutral-900 dark:text-neutral-50'
                      }`}
                    >
                      {plan.label}
                    </h3>
                    <p
                      className={`text-xs font-medium ${
                        highlighted && showcase
                          ? 'text-neutral-400'
                          : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {planDescription(plan)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-end gap-1">
                  <p
                    className={`text-4xl font-extrabold tracking-tight sm:text-[2.75rem] sm:leading-none ${
                      highlighted && showcase ? 'text-white' : 'text-neutral-900 dark:text-neutral-50'
                    }`}
                  >
                    {plan.displayPrice ?? '—'}
                  </p>
                  {plan.displayPrice && (
                    <span
                      className={`mb-1 text-sm font-semibold ${
                        highlighted && showcase ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      /{plan.intervalLabel || 'ay'}
                    </span>
                  )}
                </div>

                {equiv != null && savings != null && savings > 0 && (
                  <p
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      highlighted && showcase
                        ? 'bg-primary-500/15 text-primary-200 ring-1 ring-primary-400/25'
                        : 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                    }`}
                  >
                    Aylık ~{formatTry(equiv)} · %{savings} tasarruf
                  </p>
                )}

                {trialActive && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-400">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Deneme süresince ücretsiz
                  </p>
                )}
              </div>

              {showFeatures && (
                <ul className="mb-6 flex-1 space-y-2.5 border-t border-neutral-100 pt-5 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-200">
                  {PLAN_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" strokeWidth={2.5} aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {(compact || showcase) && <div className="flex-1" />}

              {trialActive ? (
                <p
                  className={`mt-auto cursor-not-allowed rounded-full py-3.5 text-center text-sm font-semibold ${
                    highlighted && showcase
                      ? 'bg-white/10 text-neutral-400'
                      : 'border border-neutral-200 bg-neutral-100 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                  title="Deneme süresince satın alma kapalı"
                >
                  Deneme süresinde
                </p>
              ) : canCheckout ? (
                <button
                  type="button"
                  disabled={Boolean(checkoutLoadingPriceId)}
                  onClick={() => onCheckout(plan.priceId)}
                  className={`mt-auto w-full rounded-full py-3.5 text-sm font-semibold transition disabled:opacity-60 ${ctaClass}`}
                >
                  {checkoutLoadingPriceId === plan.priceId ? 'Yönlendiriliyor…' : 'Aboneliği başlat'}
                </button>
              ) : isOwner ? (
                <Link
                  href="/dashboard/business/subscription"
                  className={`mt-auto block w-full rounded-full py-3.5 text-center text-sm font-semibold transition ${ctaClass}`}
                >
                  Aboneliğe git
                </Link>
              ) : (
                <Link
                  href="/register?type=business_owner&from=/pricing"
                  className={`mt-auto block w-full rounded-full py-3.5 text-center text-sm font-semibold transition ${ctaClass}`}
                >
                  Ücretsiz başla
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

const FEATURE_META = [
  { icon: Zap, label: 'Sınırsız randevu' },
  { icon: Users, label: 'Sınırsız personel' },
  { icon: MessageCircle, label: 'WhatsApp bildirimleri' },
  { icon: Calendar, label: 'Takvim yönetimi' },
  { icon: Video, label: 'Keşfet videosu' },
  { icon: Bell, label: 'Otomatik hatırlatmalar' },
  { icon: Headphones, label: 'Öncelikli destek' },
] as const;

export function PricingFeaturesBento() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-10">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
          Dahil olanlar
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
          Her pakette aynı güçlü özellik seti
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-600 dark:text-neutral-400">
          Ödeme periyodunu siz seçin; özelliklerde hiçbir kısıtlama yok.
        </p>
      </div>

      <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURE_META.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="group flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-700/80 dark:bg-neutral-800/80"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-500 group-hover:text-white dark:bg-primary-950/50 dark:text-primary-300">
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** @deprecated use PricingFeaturesBento on marketing pages */
export function PricingFeaturesPanel() {
  return <PricingFeaturesBento />;
}

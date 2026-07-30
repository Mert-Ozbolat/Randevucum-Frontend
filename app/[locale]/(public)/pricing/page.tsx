'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { Outfit } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { PricingFeaturesBento, PricingPlanCards } from '@/components/pricing/PricingPlanCards';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { api } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { useAuthStore } from '@/store/authStore';
import { isBusinessOwner } from '@/lib/auth';
import { isTrialBlockingPurchase } from '@/lib/subscriptionTrial';
import { Link } from '@/i18n/navigation';

const display = Outfit({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

type SubStatus = {
  endDate?: string;
  isActive: boolean;
  isTrial?: boolean;
  trialExpired?: boolean;
  stripeSubscriptionId?: string | null;
};

const TRUST_ICONS = [
  { Icon: Sparkles, key: 'trustTrial' as const },
  { Icon: RefreshCw, key: 'trustCancel' as const },
  { Icon: ShieldCheck, key: 'trustPci' as const },
  { Icon: CreditCard, key: 'trustStripe' as const },
] as const;

const FAQ_KEYS = ['faq1', 'faq2', 'faq3', 'faq4'] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition duration-300 ${
        open
          ? 'border-primary-200 bg-white shadow-md dark:border-primary-800/50 dark:bg-neutral-900'
          : 'border-neutral-200/80 bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/40'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
        aria-expanded={open}
      >
        <span className="font-semibold text-neutral-900 dark:text-neutral-50">{q}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
            open ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
          }`}
        >
          {open ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <p className="border-t border-neutral-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-neutral-600 dark:border-neutral-800 dark:text-neutral-400 sm:px-6">
          {a}
        </p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const t = useTranslations('pricing');
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isOwner = Boolean(token && isBusinessOwner(user));
  const isLoggedInCustomer = Boolean(token && user && !isBusinessOwner(user));

  const { plans, trialDays, loading } = usePricingPlans();
  const [sub, setSub] = useState<SubStatus | null>(null);

  const faqItems = useMemo(
    () =>
      FAQ_KEYS.map((key) => ({
        q: t(`${key}q` as 'faq1q'),
        a: t(`${key}a` as 'faq1a'),
      })),
    [t]
  );

  useEffect(() => {
    if (!token || !isBusinessOwner(user)) return;
    let cancelled = false;
    fetchMyBusinesses<{ data: { _id: string }[] }>()
      .then((res) => {
        const bid = (res.data.data || [])[0]?._id;
        if (!bid) return;
        return api.get<{ data: SubStatus }>(`/subscription/status/${bid}`);
      })
      .then((r) => {
        if (r && !cancelled) setSub(r.data.data);
      })
      .catch(() => {
        if (!cancelled) setSub(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token, user?.role]);

  const trialActive = isTrialBlockingPurchase(sub);
  const trialEndLabel =
    sub?.endDate && trialActive
      ? new Date(sub.endDate).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;

  return (
    <div className="overflow-x-hidden bg-neutral-50 dark:bg-neutral-950">
      <section className="relative flex min-h-[min(88svh,720px)] items-center overflow-hidden bg-neutral-900">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-primary-500/25 blur-3xl" />
          <div className="absolute -right-20 bottom-1/4 h-[32rem] w-[32rem] rounded-full bg-accent-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <AnimateIn immediate animation="fade-in">
            <p className="inline-flex rounded-full bg-primary-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-300 ring-1 ring-primary-400/25 backdrop-blur-sm">
              {t('eyebrow')}
            </p>
          </AnimateIn>

          <AnimateIn immediate animation="slide-up" delay={60}>
            <h1
              className={`${display.className} mt-6 text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl`}
            >
              {t('heroTitle1')}
              <span className="mt-1 block text-primary-400">{t('heroTitle2')}</span>
            </h1>
          </AnimateIn>

          <AnimateIn immediate animation="slide-up" delay={120}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
              {t('heroDescription', {
                days: trialDays,
                monthly: '₺999',
                quarterly: '₺2.700',
                yearly: '₺9.600',
              })}
            </p>
          </AnimateIn>

          <AnimateIn immediate animation="slide-up" delay={180}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register?type=business_owner&from=/pricing"
                className="group inline-flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-400 sm:text-base"
              >
                {t('startTrial')}
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </Link>
              <a
                href="#plans"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:text-base"
              >
                {t('viewPlans')}
              </a>
            </div>
          </AnimateIn>

          <AnimateIn immediate animation="fade-in" delay={240}>
            <ul className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST_ICONS.map(({ Icon, key }) => (
                <li
                  key={key}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-medium text-neutral-200 backdrop-blur-sm sm:text-sm"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary-400" strokeWidth={2} aria-hidden />
                  {t(key, { days: trialDays })}
                </li>
              ))}
            </ul>
          </AnimateIn>
        </div>
      </section>

      <section id="plans" className="relative -mt-8 scroll-mt-24 px-4 pb-8 sm:px-6 lg:pb-12">
        <div className="mx-auto max-w-6xl">
          {trialActive && (
            <div className="mb-8 rounded-2xl border border-primary-200/80 bg-white p-5 shadow-lg dark:border-primary-900/50 dark:bg-neutral-900">
              <p className="flex items-center justify-center gap-2 font-semibold text-primary-800 dark:text-primary-200">
                <Sparkles className="h-4 w-4" aria-hidden />
                {t('trialActive')}
              </p>
              <p className="mt-2 text-center text-sm text-primary-700/90 dark:text-primary-100/80">
                {trialEndLabel
                  ? t('trialUntil', { date: trialEndLabel })
                  : t('trialOngoing', { days: trialDays })}{' '}
                {t('trialActiveDesc')}
              </p>
            </div>
          )}

          {isLoggedInCustomer && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
              <p className="text-center font-semibold text-amber-900 dark:text-amber-100">
                {t('businessAccountRequired')}
              </p>
              <p className="mt-1 text-center text-sm text-amber-800/90 dark:text-amber-200/90">
                {t('businessAccountDesc')}
              </p>
              <div className="mt-4 flex justify-center">
                <Link
                  href="/register?type=business_owner&from=/pricing"
                  className="rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  {t('createBusinessAccount')}
                </Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center rounded-[2rem] bg-white py-24 shadow-xl dark:bg-neutral-900">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : (
            <AnimateIn animation="slide-up">
              <div className="rounded-[2rem] border border-neutral-200/60 bg-white/80 p-6 shadow-2xl shadow-neutral-900/5 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80 sm:p-8 lg:p-10">
                <div className="mb-8 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                    {t('choosePlan')}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                    {t('flexibleBilling')}
                  </h2>
                </div>
                <PricingPlanCards plans={plans} trialActive={trialActive} isOwner={isOwner} showcase />
              </div>
            </AnimateIn>
          )}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <AnimateIn animation="slide-up">
            <PricingFeaturesBento />
          </AnimateIn>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <AnimateIn animation="slide-up">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                {t('faqEyebrow')}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                {t('faqTitle')}
              </h2>
            </div>
            <div className="mt-8 space-y-3">
              {faqItems.map(({ q, a }) => (
                <FaqItem key={q} q={q} a={a} />
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:pb-24">
        <AnimateIn animation="scale-in">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-neutral-900 px-6 py-14 text-center sm:px-12">
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-primary-500/30 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <h2 className={`${display.className} text-3xl font-bold text-white sm:text-4xl`}>
                {t('ctaTitle')}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-neutral-300">
                {t('ctaDesc', { days: trialDays })}
              </p>
              <Link
                href="/register?type=business_owner&from=/pricing"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-400"
              >
                {t('ctaButton')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </AnimateIn>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {t.rich('legalNotice', {
            distanceSales: (chunks) => (
              <Link href="/distance-sales" className="text-primary-600 hover:underline dark:text-primary-400">
                {chunks}
              </Link>
            ),
            refundPolicy: (chunks) => (
              <Link href="/refund-policy" className="text-primary-600 hover:underline dark:text-primary-400">
                {chunks}
              </Link>
            ),
            terms: (chunks) => (
              <Link href="/terms" className="text-primary-600 hover:underline dark:text-primary-400">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>
    </div>
  );
}

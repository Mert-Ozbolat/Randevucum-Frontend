'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PricingFeaturesPanel, PricingPlanCards } from '@/components/pricing/PricingPlanCards';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { api } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { useAuthStore } from '@/store/authStore';
import { isBusinessOwner } from '@/lib/auth';
import { isTrialBlockingPurchase } from '@/lib/subscriptionTrial';

type SubStatus = {
  endDate?: string;
  isActive: boolean;
  isTrial?: boolean;
  trialExpired?: boolean;
  stripeSubscriptionId?: string | null;
};

const FAQ = [
  {
    q: 'Paketler arasında özellik farkı var mı?',
    a: 'Hayır. Aylık, 3 aylık ve yıllık paketlerin tamamı aynı özellikleri içerir; yalnızca ödeme periyodu ve tutar değişir.',
  },
  {
    q: 'Ücretsiz deneme nasıl çalışır?',
    a: 'Yeni işletme hesapları belirtilen süre boyunca tüm özellikleri ücretsiz dener. Deneme bitene kadar ücretli abonelik başlatılamaz.',
  },
  {
    q: 'İstediğim zaman iptal edebilir miyim?',
    a: 'Evet. Aboneliğinizi dönem sonunda iptal edebilirsiniz; bu tarihe kadar erişiminiz devam eder.',
  },
] as const;

export default function PricingPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isOwner = Boolean(token && isBusinessOwner(user));
  const isLoggedInCustomer = Boolean(token && user && !isBusinessOwner(user));

  const { plans, trialDays, loading } = usePricingPlans();
  const [sub, setSub] = useState<SubStatus | null>(null);

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
      ? new Date(sub.endDate).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-900 px-4 py-16 text-center text-white sm:px-6 sm:py-20 lg:py-24">
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary-500/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 translate-x-1/2 rounded-full bg-accent-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="inline-flex rounded-full border border-primary-500/40 bg-primary-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">
            İşletme paketleri
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Tek paket, üç ödeme seçeneği
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
            {trialDays} gün ücretsiz deneyin. Sonrasında aylık <strong className="text-white">₺999</strong>, 3 aylık{' '}
            <strong className="text-white">₺2.700</strong> veya yıllık <strong className="text-white">₺9.600</strong>{' '}
            ile devam edin — tüm özellikler dahil.
          </p>
          <Link
            href="/register?type=business_owner&from=/pricing"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-400 sm:text-base"
          >
            Ücretsiz denemeyi başlat
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20 lg:px-8">
        {trialActive && (
          <div className="mx-auto mb-10 max-w-3xl rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-900 dark:border-primary-900/50 dark:bg-primary-950/30 dark:text-primary-100">
            <p className="flex items-center justify-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4" aria-hidden />
              Ücretsiz denemeniz aktif
            </p>
            <p className="mt-2 text-center text-primary-800/90 dark:text-primary-100/80">
              {trialEndLabel
                ? `${trialEndLabel} tarihine kadar tüm özellikleri ücretsiz kullanıyorsunuz.`
                : `${trialDays} günlük denemeniz devam ediyor.`}{' '}
              Deneme bitince aşağıdan abonelik başlatabilirsiniz.
            </p>
          </div>
        )}

        {isLoggedInCustomer && (
          <div className="mx-auto mb-10 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-semibold">İşletme paketi için işletme hesabı gerekir</p>
            <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
              Paket satın almak için işletme hesabı oluşturmalısınız.
            </p>
            <Link
              href="/register?type=business_owner&from=/pricing"
              className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              İşletme hesabı oluştur
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <PricingPlanCards plans={plans} trialActive={trialActive} isOwner={isOwner} />
            <div className="mt-14">
              <PricingFeaturesPanel />
            </div>
          </>
        )}

        {/* SSS */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Sık sorulan sorular
          </h2>
          <div className="mt-8 space-y-4">
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900/60"
              >
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">{q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mx-auto mt-14 max-w-2xl text-center text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          Abonelik satın alarak{' '}
          <Link href="/distance-sales" className="text-primary-600 hover:underline dark:text-primary-400">
            Mesafeli Satış Sözleşmesi
          </Link>
          ,{' '}
          <Link href="/refund-policy" className="text-primary-600 hover:underline dark:text-primary-400">
            İptal ve İade Politikası
          </Link>{' '}
          ve{' '}
          <Link href="/terms" className="text-primary-600 hover:underline dark:text-primary-400">
            Kullanım Koşulları
          </Link>
          ’nı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { useAuthStore } from '@/store/authStore';
import { isBusinessOwner } from '@/lib/auth';
import { isTrialBlockingPurchase, PLAN_FEATURES } from '@/lib/subscriptionTrial';

type PublicPlan = {
  priceId: string;
  label: string;
  planKey: 'standard' | 'pro';
  displayAmount: number;
  displayPrice: string;
  intervalLabel?: string;
};

type SubStatus = {
  endDate?: string;
  isActive: boolean;
  isTrial?: boolean;
  trialExpired?: boolean;
  stripeSubscriptionId?: string | null;
  planKey?: string;
};

const TRIAL_DAYS = 30;

export default function PricingPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isOwner = Boolean(token && isBusinessOwner(user));
  const isLoggedInCustomer = Boolean(token && user && !isBusinessOwner(user));

  const [catalogPlans, setCatalogPlans] = useState<PublicPlan[]>([]);
  const [trialDays, setTrialDays] = useState(TRIAL_DAYS);
  const [sub, setSub] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const tasks: Promise<void>[] = [
      api
        .get<{ data: { plans: PublicPlan[]; trialDays?: number } }>('/payments/stripe/plans')
        .then((res) => {
          if (cancelled) return;
          setCatalogPlans(res.data.data?.plans || []);
          if (res.data.data?.trialDays) setTrialDays(res.data.data.trialDays);
        })
        .catch(() => {
          if (!cancelled) setCatalogPlans([]);
        }),
    ];

    if (token && isBusinessOwner(user)) {
      tasks.push(
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
          })
      );
    }

    void Promise.all(tasks).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [token, user?.role]);

  const trialActive = isTrialBlockingPurchase(sub);

  const plans = useMemo(() => {
    const list = catalogPlans.length ? catalogPlans : [];

    return list.map((p) => ({
      ...p,
      name: p.label,
      description:
        p.planKey === 'pro'
          ? 'Gelişmiş özellikler ve otomasyon'
          : 'Randevu yönetimi için hızlı başlangıç',
      features: [...PLAN_FEATURES[p.planKey]],
      highlighted: p.planKey === 'pro',
      currentTrialPlan: trialActive && p.planKey === 'pro',
    }));
  }, [catalogPlans, trialActive]);

  const trialEndLabel =
    sub?.endDate && trialActive
      ? new Date(sub.endDate).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 sm:text-4xl">Fiyatlar</h1>
        <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-300">
          Yeni işletme hesaplarına {trialDays} gün ücretsiz <strong>PRO</strong> deneme verilir. Liste fiyatları
          aylıktır.
        </p>
      </div>

      {trialActive && (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-900 dark:border-primary-900/50 dark:bg-primary-950/30 dark:text-primary-100">
          <p className="flex items-center justify-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4" aria-hidden />
            PRO denemeniz aktif
          </p>
          <p className="mt-2 text-center text-primary-800/90 dark:text-primary-100/80">
            {trialEndLabel
              ? `${trialEndLabel} tarihine kadar tüm PRO özelliklerini ücretsiz kullanıyorsunuz.`
              : `${trialDays} günlük PRO denemeniz devam ediyor.`}{' '}
            Deneme bitene kadar paket satın alma kapalıdır; bitince buradan abonelik başlatabilirsiniz.
          </p>
        </div>
      )}

      {isLoggedInCustomer && (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-semibold">İşletme paketi için işletme hesabı gerekir</p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
            Paket satın almak için işletme hesabı oluşturmalısınız.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Link
              href="/register?type=business_owner&from=/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              İşletme hesabı oluştur
            </Link>
          </div>
        </div>
      )}

      {!loading && plans.length === 0 && (
        <p className="mt-12 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Paket fiyatları yüklenemedi. Sunucuda <code className="text-xs">STRIPE_PRICE_ID</code> alanlarına{' '}
          <code className="text-xs">price_...</code> veya <code className="text-xs">prod_...</code> yazın.
        </p>
      )}

      {loading ? (
        <div className="mt-16 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : plans.length > 0 ? (
        <div className="mt-12 grid gap-8 md:mx-auto md:max-w-4xl md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.priceId}
              className={`relative ${plan.highlighted ? 'ring-2 ring-primary-500 shadow-soft' : ''}`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-3 py-0.5 text-xs font-medium text-white">
                  {plan.currentTrialPlan ? 'Deneme paketiniz' : 'Önerilen'}
                </span>
              )}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">{plan.name}</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{plan.description}</p>
                <p className="mt-3 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  {plan.displayPrice ?? '—'}
                  {plan.displayPrice ? (
                    <span className="text-base font-normal text-neutral-500 dark:text-neutral-400">
                      /{plan.intervalLabel || 'ay'}
                    </span>
                  ) : null}
                </p>
                {plan.currentTrialPlan && (
                  <p className="mt-2 text-sm font-medium text-primary-700 dark:text-primary-300">
                    Şu an ücretsiz — deneme süresince
                  </p>
                )}
              </div>
              <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary-500" strokeWidth={2.5} aria-hidden /> {f}
                  </li>
                ))}
              </ul>
              {trialActive ? (
                <p
                  className="mt-6 block w-full cursor-not-allowed rounded-lg border-2 border-neutral-200 bg-neutral-100 py-2.5 text-center text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                  title="Deneme süresince satın alma kapalı"
                >
                  Deneme süresinde
                </p>
              ) : isOwner ? (
                <Link
                  href="/dashboard/business/subscription"
                  className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition ${
                    plan.highlighted
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'border-2 border-neutral-300 bg-white text-neutral-700 hover:border-primary-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  Aboneliğe git
                </Link>
              ) : (
                <Link
                  href="/register?type=business_owner&from=/pricing"
                  className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition ${
                    plan.highlighted
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'border-2 border-neutral-300 bg-white text-neutral-700 hover:border-primary-400 dark:border-neutral-600 dark:bg-neutral-900'
                  }`}
                >
                  İşletme olarak başla
                </Link>
              )}
            </Card>
          ))}
        </div>
      ) : null}

      <p className="mx-auto mt-12 max-w-2xl text-center text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
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
  );
}

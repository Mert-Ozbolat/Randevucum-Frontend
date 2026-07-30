'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getApiErrorMessage } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { SUBSCRIPTION_STATUS } from '@/lib/constants';
import { isTrialBlockingPurchase } from '@/lib/subscriptionTrial';
import { PricingPlanCards } from '@/components/pricing/PricingPlanCards';
import type { PublicPlan } from '@/lib/pricing';
import { CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

interface SubStatus {
  _id?: string;
  businessId: string;
  status?: string;
  endDate?: string;
  isActive: boolean;
  canAcceptBookings?: boolean;
  hasProAccess?: boolean;
  hasSubscription?: boolean;
  planKey?: string;
  staffLimit?: number | null;
  staffCount?: number;
  canAddStaff?: boolean;
  reservationLimit?: number | null;
  reservationCount?: number;
  canAcceptMoreReservations?: boolean;
  isTrial?: boolean;
  trialExpired?: boolean;
  needsRenewal?: boolean;
  inGracePeriod?: boolean;
  cancelAtPeriodEnd?: boolean;
  billingNotice?: string | null;
  billingSuspended?: boolean;
  stripeSubscriptionId?: string | null;
  gracePeriodEndsAt?: string | null;
}

interface StripePlan {
  priceId: string;
  label: string;
  planKey?: 'pro';
  displayPrice?: string;
  displayAmount?: number;
  intervalLabel?: string;
  billingPeriod?: 'monthly' | 'quarterly' | 'yearly' | 'custom';
}

interface StripeConfig {
  checkoutEnabled: boolean;
  publishableKey?: string;
  plans?: StripePlan[];
  trialDays?: number;
}

function toPublicPlans(plans?: StripePlan[]): PublicPlan[] {
  return (plans || []).map((p) => ({
    priceId: p.priceId,
    label: p.label,
    planKey: 'pro' as const,
    displayAmount: p.displayAmount ?? 0,
    displayPrice: p.displayPrice ?? '—',
    intervalLabel: p.intervalLabel,
    billingPeriod: p.billingPeriod,
  }));
}

export default function SubscriptionPage() {
  const { addToast } = useToast();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubStatus | null>(null);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoadingPriceId, setCheckoutLoadingPriceId] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSubscription = useCallback(async (bid: string) => {
    const res = await api.get<{ data: SubStatus }>(`/subscription/status/${bid}`);
    setSubscription(res.data.data);
    return res.data.data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      fetchMyBusinesses<{ data: { _id: string }[] }>()
      .then(async (res) => {
        const list = res.data.data || [];
        if (!list[0]) return;
        const bid = list[0]._id;
        if (cancelled) return;
        setBusinessId(bid);
        await loadSubscription(bid);
        try {
          const cfg = await api.get<{ data: StripeConfig }>('/payments/stripe/config');
          if (!cancelled) setStripeConfig(cfg.data.data);
        } catch {
          if (!cancelled) setStripeConfig({ checkoutEnabled: false });
        }
      })
      .catch(() => {
        if (!cancelled) setError('Yüklenemedi.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadSubscription]);

  useEffect(() => {
    if (typeof window === 'undefined' || !businessId) return;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (checkout === 'success') {
      addToast('success', 'Ödeme tamamlandı. Abonelik birkaç saniye içinde güncellenir.');
      window.history.replaceState({}, '', '/dashboard/business/subscription');
      let n = 0;
      const id = setInterval(() => {
        n += 1;
        void loadSubscription(businessId);
        if (n >= 15) clearInterval(id);
      }, 2000);
      return () => clearInterval(id);
    }
    if (checkout === 'cancel') {
      addToast('info', 'Ödeme sayfasından çıkıldı.');
      window.history.replaceState({}, '', '/dashboard/business/subscription');
    }
  }, [businessId, addToast, loadSubscription]);

  const startStripeCheckout = async (priceId: string) => {
    if (!businessId || !priceId) return;
    if (isTrialBlockingPurchase(subscription)) {
      addToast('info', 'Deneme süresince paket satın alınamaz. Deneme bitince tekrar deneyin.');
      return;
    }
    setCheckoutLoadingPriceId(priceId);
    setError('');
    try {
      const res = await api.post<{ data: { url?: string } }>('/payments/stripe/checkout-session', {
        businessId,
        priceId,
      });
      const url = res.data.data?.url;
      if (url) window.location.href = url;
      else setError('Ödeme bağlantısı alınamadı.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setCheckoutLoadingPriceId(null);
    }
  };

  const openBillingPortal = async () => {
    if (!businessId) return;
    setPortalLoading(true);
    setError('');
    try {
      const res = await api.post<{ data: { url?: string } }>('/payments/stripe/billing-portal', { businessId });
      const url = res.data.data?.url;
      if (url) window.location.href = url;
      else setError('Portal bağlantısı alınamadı.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setPortalLoading(false);
    }
  };

  const cancelAtPeriodEnd = async () => {
    if (!subscription?._id) return;
    if (!window.confirm('Abonelik dönem sonunda iptal edilecek. Bu tarihe kadar erişiminiz devam eder. Onaylıyor musunuz?')) {
      return;
    }
    setCancelLoading(true);
    setError('');
    try {
      await api.patch(`/subscription/${subscription._id}/cancel`);
      addToast('success', 'Abonelik dönem sonunda iptal edilecek şekilde ayarlandı.');
      if (businessId) await loadSubscription(businessId);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setCancelLoading(false);
    }
  };

  const reactivate = async () => {
    if (!subscription?._id) return;
    setReactivateLoading(true);
    setError('');
    try {
      await api.patch(`/subscription/${subscription._id}/reactivate`);
      addToast('success', 'Otomatik yenileme tekrar açıldı.');
      if (businessId) await loadSubscription(businessId);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setReactivateLoading(false);
    }
  };

  const startDemoSubscription = async () => {
    if (!businessId) return;
    setDemoLoading(true);
    setError('');
    try {
      await api.post('/subscription/subscribe', { businessId });
      addToast('success', 'Demo abonelik 30 gün için aktifleştirildi.');
      await loadSubscription(businessId);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDemoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const trialBlocksPurchase = isTrialBlockingPurchase(subscription);

  const needsPay =
    !trialBlocksPurchase &&
    (subscription?.trialExpired ||
      subscription?.billingSuspended ||
      (!subscription?.canAcceptBookings && subscription?.needsRenewal));

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-8 text-white shadow-soft sm:px-10">
        <p className="text-sm font-medium text-primary-100">Faturalandırma</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Abonelik</h1>
        <p className="mt-2 max-w-2xl text-sm text-primary-100">
          Yeni işletmelere 30 gün ücretsiz deneme verilir. Deneme sonrası aylık, 3 aylık veya yıllık abonelik
          seçebilirsiniz; otomatik yenilenir, istediğiniz zaman dönem sonunda iptal edebilirsiniz.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-primary-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
            <ShieldCheck className="h-4 w-4" aria-hidden /> PCI uyumlu ödeme (Stripe)
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
            <CreditCard className="h-4 w-4" aria-hidden /> Kart bilgileri bizde tutulmaz
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {trialBlocksPurchase && (
        <div className="rounded-2xl border border-primary-200 bg-primary-50/80 p-4 dark:border-primary-900/50 dark:bg-primary-950/30">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary-900 dark:text-primary-100">
            <Sparkles className="h-4 w-4" aria-hidden />
            Ücretsiz deneme aktif
          </p>
          <p className="mt-1 text-sm text-primary-800/90 dark:text-primary-100/80">
            {subscription?.endDate &&
              `${new Date(subscription.endDate).toLocaleDateString('tr-TR')} tarihine kadar tüm özellikleri ücretsiz kullanıyorsunuz. `}
            Deneme bitene kadar paket satın alma kapalıdır; aşağıda güncel liste fiyatlarını görebilirsiniz.
          </p>
        </div>
      )}

      {trialBlocksPurchase && (stripeConfig?.plans?.length ?? 0) > 0 && (
        <PricingPlanCards
          plans={toPublicPlans(stripeConfig?.plans)}
          trialActive
          isOwner
          compact
        />
      )}

      {subscription?.billingSuspended && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm font-semibold text-red-900 dark:text-red-100">İşletme offline</p>
          <p className="mt-1 text-sm text-red-800 dark:text-red-200">
            Ödeme alınamadı. İşletmeniz listede ve Keşfet&apos;te görünmez; yeni randevu alınamaz. Ödeme yönteminizi
            güncelleyerek tekrar yayına alın.
          </p>
          {subscription.stripeSubscriptionId && (
            <Button
              type="button"
              size="sm"
              className="mt-3"
              loading={portalLoading}
              onClick={() => void openBillingPortal()}
            >
              Ödeme yöntemini güncelle
            </Button>
          )}
        </div>
      )}

      {subscription?.stripeSubscriptionId && subscription.canAcceptBookings && !subscription.cancelAtPeriodEnd && (
        <div className="rounded-2xl border border-primary-200 bg-primary-50/80 p-4 dark:border-primary-900/50 dark:bg-primary-950/30">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary-900 dark:text-primary-100">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Otomatik yenileme açık
          </p>
          <p className="mt-1 text-sm text-primary-800/90 dark:text-primary-100/80">
            Aboneliğiniz her dönem sonunda kayıtlı kartınızdan otomatik tahsil edilir. Her ay kart bilgisi girmeniz
            gerekmez. İptal etmediğiniz sürece kesintisiz devam eder.
          </p>
        </div>
      )}

      <Card className="p-0">
        <CardHeader>
          <CardTitle>Mevcut durum</CardTitle>
        </CardHeader>
        {subscription && (
          <div className="space-y-2 px-6 pb-6">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              Durum:{' '}
              <span
                className={
                  subscription.canAcceptBookings
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-red-600 dark:text-red-400'
                }
              >
                {subscription.billingSuspended
                  ? 'Askıda'
                  : subscription.canAcceptBookings
                    ? subscription.isTrial
                      ? 'Deneme'
                      : 'Aktif'
                    : SUBSCRIPTION_STATUS[subscription.status || ''] || subscription.status || 'Yok'}
              </span>
            </p>
            {subscription.endDate && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {subscription.cancelAtPeriodEnd ? 'Erişim bitişi' : 'Dönem bitişi'}:{' '}
                {new Date(subscription.endDate).toLocaleDateString('tr-TR')}
              </p>
            )}
            {subscription.inGracePeriod && subscription.gracePeriodEndsAt && (
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Ödeme grace süresi: {new Date(subscription.gracePeriodEndsAt).toLocaleDateString('tr-TR')} tarihine
                kadar erişiminiz devam eder.
              </p>
            )}
            {subscription.cancelAtPeriodEnd && (
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Abonelik dönem sonunda iptal edilecek; bu tarihe kadar erişiminiz sürer.
              </p>
            )}
            {subscription.planKey && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Paket:{' '}
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {subscription.isTrial ? 'Deneme' : 'Randevucum'}
                </span>
              </p>
            )}
            {subscription.staffLimit != null && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Personel: {subscription.staffCount ?? 0} / {subscription.staffLimit}
              </p>
            )}
            {subscription.staffLimit == null && subscription.hasProAccess && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Personel: sınırsız</p>
            )}
            {subscription.reservationLimit != null && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Bu ay randevu:{' '}
                <span
                  className={
                    subscription.canAcceptMoreReservations
                      ? 'font-medium text-neutral-800 dark:text-neutral-200'
                      : 'font-semibold text-red-600 dark:text-red-400'
                  }
                >
                  {subscription.reservationCount ?? 0} / {subscription.reservationLimit}
                </span>
                {!subscription.canAcceptMoreReservations && ' — limit doldu'}
              </p>
            )}
            {subscription.reservationLimit == null && subscription.hasProAccess && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Randevu: sınırsız</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {subscription.stripeSubscriptionId && (
                <Button type="button" variant="outline" loading={portalLoading} onClick={() => void openBillingPortal()}>
                  Ödeme yöntemini yönet
                </Button>
              )}
              {subscription.isActive &&
                !subscription.cancelAtPeriodEnd &&
                subscription.stripeSubscriptionId && (
                  <Button type="button" variant="outline" loading={cancelLoading} onClick={() => void cancelAtPeriodEnd()}>
                    Dönem sonunda iptal et
                  </Button>
                )}
              {subscription.cancelAtPeriodEnd && subscription.stripeSubscriptionId && (
                <Button type="button" variant="outline" loading={reactivateLoading} onClick={() => void reactivate()}>
                  Otomatik yenilemeyi aç
                </Button>
              )}
            </div>
          </div>
        )}

        {needsPay && businessId && (
          <div className="border-t border-neutral-200 px-6 py-6 dark:border-neutral-800">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {subscription?.trialExpired
                ? 'Deneme süreniz bitti. Randevu almaya devam etmek için abonelik başlatın.'
                : 'Randevu alabilmek için geçerli bir abonelik gerekir.'}
            </p>
            {stripeConfig?.checkoutEnabled && (stripeConfig.plans?.length ?? 0) > 0 ? (
              <div className="mt-4">
                <PricingPlanCards
                  plans={toPublicPlans(stripeConfig.plans)}
                  isOwner
                  checkoutLoadingPriceId={checkoutLoadingPriceId}
                  onCheckout={(priceId) => void startStripeCheckout(priceId)}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-neutral-500">Stripe yapılandırması gerekli (geliştirme: demo abonelik).</p>
                <Button type="button" variant="outline" loading={demoLoading} onClick={() => void startDemoSubscription()}>
                  Demo: 30 gün abonelik
                </Button>
              </div>
            )}
            <Link href="/pricing" className="mt-4 inline-block text-sm font-medium text-primary-700 dark:text-primary-300">
              Planları karşılaştır →
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

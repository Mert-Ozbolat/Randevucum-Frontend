'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getApiErrorMessage } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { SUBSCRIPTION_STATUS } from '@/lib/constants';
import { Check, CreditCard, ShieldCheck } from 'lucide-react';

interface SubStatus {
  businessId: string;
  status?: string;
  endDate?: string;
  isActive: boolean;
  hasSubscription?: boolean;
  planKey?: string;
  staffLimit?: number | null;
  staffCount?: number;
  canAddStaff?: boolean;
}

interface StripePlan {
  priceId: string;
  label: string;
}

interface StripeConfig {
  checkoutEnabled: boolean;
  publishableKey?: string;
  plans?: StripePlan[];
}

export default function SubscriptionPage() {
  const { addToast } = useToast();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubStatus | null>(null);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoadingPriceId, setCheckoutLoadingPriceId] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSubscription = useCallback(async (bid: string) => {
    const res = await api.get<{ data: SubStatus }>(`/subscription/status/${bid}`);
    setSubscription(res.data.data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get<{ data: { _id: string }[] }>('/business')
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

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-8 text-white shadow-soft sm:px-10">
        <p className="text-sm font-medium text-primary-100">Faturalandırma</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Abonelik</h1>
        <p className="mt-2 max-w-2xl text-sm text-primary-100">
          Aboneliğiniz aktifse randevu alabilirsiniz. Ödeme işlemi Stripe üzerinden güvenli şekilde tamamlanır.
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
      <Card className="p-0">
        <CardHeader>
          <CardTitle>Mevcut durum</CardTitle>
        </CardHeader>
        {subscription && (
          <div className="space-y-2 px-6 pb-6">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              Durum:{' '}
              <span className={subscription.isActive ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'}>
                {subscription.isActive
                  ? 'Aktif'
                  : SUBSCRIPTION_STATUS[subscription.status || ''] || subscription.status || 'Yok'}
              </span>
            </p>
            {subscription.endDate && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Bitiş: {new Date(subscription.endDate).toLocaleDateString('tr-TR')}
              </p>
            )}
            {subscription.planKey && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Paket:{' '}
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {subscription.planKey === 'pro' ? 'Pro' : 'Standart / Başlangıç'}
                </span>
              </p>
            )}
            {subscription.staffLimit != null && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Personel: {subscription.staffCount ?? 0} / {subscription.staffLimit}
              </p>
            )}
            {subscription.staffLimit == null && subscription.planKey === 'pro' && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Personel: sınırsız (Pro)</p>
            )}
          </div>
        )}
        {!subscription?.isActive && businessId && (
          <div className="border-t border-neutral-200 px-6 py-6 dark:border-neutral-800">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Randevu alabilmek için aboneliğinizin aktif olması gerekir.
            </p>
            {stripeConfig?.checkoutEnabled && (stripeConfig.plans?.length ?? 0) > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {(stripeConfig.plans || []).map((p) => (
                  <div
                    key={p.priceId}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-950/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{p.label}</p>
                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                          Aylık abonelik • Online ödeme
                        </p>
                      </div>
                      <span className="rounded-full bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-800 dark:bg-primary-950/50 dark:text-primary-50">
                        Önerilen
                      </span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
                      {(p.label.toLowerCase().includes('pro')
                        ? [
                            'Randevu almaya başla',
                            'Sınırsız personel',
                            'WhatsApp bildirimleri',
                            'İşletme paneli',
                          ]
                        : [
                            'Randevu almaya başla',
                            'En fazla 1 personel',
                            'Hizmet yönetimi',
                            'İşletme paneli',
                          ]
                      ).map((x) => (
                        <li key={x} className="flex items-center gap-2">
                          <Check className="h-4 w-4 shrink-0 text-primary-500" strokeWidth={2.5} aria-hidden /> {x}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        loading={checkoutLoadingPriceId === p.priceId}
                        disabled={Boolean(checkoutLoadingPriceId)}
                        onClick={() => void startStripeCheckout(p.priceId)}
                      >
                        Paketi satın al
                      </Button>
                      <Link href="/pricing" className="inline-flex items-center">
                        <Button type="button" variant="outline" disabled={Boolean(checkoutLoadingPriceId)}>
                          Detayları gör
                        </Button>
                      </Link>
                    </div>
                    <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
                      Ödeme Stripe sayfasında tamamlanır. İstediğiniz zaman iptal edebilirsiniz.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  Stripe henüz sunucuda yapılandırılmadı (STRIPE_SECRET_KEY + en az bir STRIPE_PRICE_ID). Geliştirici
                  modunda deneme için aşağıdaki demo aboneliği kullanabilirsiniz.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    loading={demoLoading}
                    onClick={() => void startDemoSubscription()}
                  >
                    Demo: 30 gün aktifleştir
                  </Button>
                  <Link href="/pricing" className="inline-flex items-center">
                    <Button type="button" variant="outline">
                      Planları görüntüle
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

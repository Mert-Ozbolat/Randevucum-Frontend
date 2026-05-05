'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getApiErrorMessage } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { SUBSCRIPTION_STATUS } from '@/lib/constants';

interface SubStatus {
  businessId: string;
  status?: string;
  endDate?: string;
  isActive: boolean;
  hasSubscription?: boolean;
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        Abonelik & Faturalandırma
      </h1>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut durum</CardTitle>
        </CardHeader>
        {subscription && (
          <div className="space-y-2">
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
          </div>
        )}
        {!subscription?.isActive && businessId && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Randevu alabilmek için aboneliğinizin aktif olması gerekir.
            </p>
            {stripeConfig?.checkoutEnabled && (stripeConfig.plans?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  Paket seçin; ödeme Stripe güvenli sayfasında tamamlanır. Birden fazla paket için Stripe’da her biri
                  için ayrı fiyat (price_…) oluşturursunuz; gizli/yayın anahtar çifti tek kalır.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(stripeConfig.plans || []).map((p) => (
                    <Button
                      key={p.priceId}
                      type="button"
                      loading={checkoutLoadingPriceId === p.priceId}
                      disabled={Boolean(checkoutLoadingPriceId)}
                      onClick={() => void startStripeCheckout(p.priceId)}
                    >
                      Öde — {p.label}
                    </Button>
                  ))}
                  <Link href="/pricing" className="inline-flex items-center">
                    <Button type="button" variant="outline" disabled={Boolean(checkoutLoadingPriceId)}>
                      Planları görüntüle
                    </Button>
                  </Link>
                </div>
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

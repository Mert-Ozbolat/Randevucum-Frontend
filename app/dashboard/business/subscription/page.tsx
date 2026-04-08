'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getApiErrorMessage } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SUBSCRIPTION_STATUS } from '@/lib/constants';

interface SubStatus {
  businessId: string;
  status?: string;
  endDate?: string;
  isActive: boolean;
  hasSubscription?: boolean;
}

export default function SubscriptionPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ data: { _id: string }[] }>('/business')
      .then((res) => {
        const list = res.data.data || [];
        if (list[0]) {
          setBusinessId(list[0]._id);
          return api.get<{ data: SubStatus }>(`/subscription/status/${list[0]._id}`);
        }
        return null;
      })
      .then((res) => {
        if (res) setSubscription(res.data.data);
      })
      .catch(() => setError('Yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async () => {
    if (!businessId) return;
    setError('');
    setSubscribing(true);
    try {
      const { data } = await api.post<{ data: SubStatus }>('/subscription/subscribe', {
        businessId,
      });
      setSubscription(data.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubscribing(false);
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
      <h1 className="text-2xl font-bold text-neutral-900">Abonelik & Faturalandırma</h1>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut durum</CardTitle>
        </CardHeader>
        {subscription && (
          <div className="space-y-2">
            <p className="font-medium text-neutral-900">
              Durum:{' '}
              <span className={subscription.isActive ? 'text-primary-600' : 'text-red-600'}>
                {subscription.isActive
                  ? 'Aktif'
                  : SUBSCRIPTION_STATUS[subscription.status || ''] || subscription.status || 'Yok'}
              </span>
            </p>
            {subscription.endDate && (
              <p className="text-sm text-neutral-600">
                Bitiş: {new Date(subscription.endDate).toLocaleDateString('tr-TR')}
              </p>
            )}
          </div>
        )}
        {!subscription?.isActive && businessId && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-neutral-600">
              Randevu alabilmek için aylık abonelik başlatın. Ödeme entegrasyonu (Stripe) için backend
              yapılandırması gerekebilir.
            </p>
            <Button loading={subscribing} onClick={handleSubscribe}>
              Abonelik Başlat (Demo)
            </Button>
          </div>
        )}
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Stripe ile ödeme</CardTitle>
        </CardHeader>
        <p className="text-sm text-neutral-600">
          Üretimde Stripe Checkout kullanmak için backend&apos;de bir &quot;create checkout
          session&quot; endpoint&apos;i ekleyip bu sayfadan yönlendirme yapılabilir. Örnek: &quot;Ödeme
          Yap&quot; butonu → API → Stripe Checkout URL → yönlendir.
        </p>
        <Link href="/pricing" className="mt-4 inline-block">
          <Button variant="outline">Fiyatları Görüntüle</Button>
        </Link>
      </Card>
    </div>
  );
}

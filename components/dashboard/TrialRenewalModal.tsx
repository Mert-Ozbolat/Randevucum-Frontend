'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api, getApiErrorMessage } from '@/lib/api';

type StripePlan = { priceId: string; label: string };

type Props = {
  open: boolean;
  businessId: string;
  endDate?: string | null;
  plans?: StripePlan[];
  checkoutEnabled?: boolean;
  onDismiss?: () => void;
};

export function TrialRenewalModal({
  open,
  businessId,
  endDate,
  plans = [],
  checkoutEnabled,
  onDismiss,
}: Props) {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!open) return null;

  const endLabel = endDate
    ? new Date(endDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const startCheckout = async (priceId: string) => {
    setLoadingPriceId(priceId);
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
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        aria-label="Kapat"
        onClick={onDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-renewal-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
          <Sparkles className="h-5 w-5" aria-hidden />
          <span className="text-sm font-semibold uppercase tracking-wide">Ücretsiz deneme</span>
        </div>
        <h2 id="trial-renewal-title" className="mt-2 text-xl font-bold text-neutral-900 dark:text-neutral-50">
          Deneme süreniz sona erdi
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {endLabel
            ? `${endLabel} tarihinde ücretsiz denemeniz bitti.`
            : 'Ücretsiz denemeniz bitti.'}{' '}
          Randevu almaya ve tüm özelliklere devam etmek için abonelik başlatmanız gerekir. Abonelik seçtiğiniz periyotta
          otomatik yenilenir; istediğiniz zaman dönem sonunda iptal edebilirsiniz.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          {checkoutEnabled && plans.length > 0 ? (
            plans.map((p) => (
              <Button
                key={p.priceId}
                type="button"
                loading={loadingPriceId === p.priceId}
                disabled={Boolean(loadingPriceId)}
                onClick={() => void startCheckout(p.priceId)}
              >
                {p.label} — Aboneliği başlat
              </Button>
            ))
          ) : (
            <Link href="/dashboard/business/subscription">
              <Button type="button" className="w-full">
                Abonelik sayfasına git
              </Button>
            </Link>
          )}
          <Button type="button" variant="ghost" onClick={onDismiss}>
            Daha sonra
          </Button>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { isBusinessOwner } from '@/lib/auth';

type Business = {
  _id: string;
  hasPaidSubscription?: boolean;
};

type SubStatus = {
  businessId: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  hasSubscription?: boolean;
};

const TRIAL_DAYS = 30;

export default function PricingPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isOwner = Boolean(token && isBusinessOwner(user));
  const isLoggedInCustomer = Boolean(token && user && !isBusinessOwner(user));

  const [biz, setBiz] = useState<Business | null>(null);
  const [sub, setSub] = useState<SubStatus | null>(null);

  useEffect(() => {
    if (!token || !isBusinessOwner(user)) return;
    api
      .get<{ data: Business[] }>('/business')
      .then((res) => {
        const b = (res.data.data || [])[0] || null;
        setBiz(b);
        return b ? api.get<{ data: SubStatus }>(`/subscription/status/${b._id}`) : null;
      })
      .then((r) => {
        if (r) setSub(r.data.data);
      })
      .catch(() => {
        setBiz(null);
        setSub(null);
      });
  }, [token, user?.role]);

  const isTrialActive = useMemo(() => {
    if (!token || !isBusinessOwner(user)) return false;
    if (!biz || biz.hasPaidSubscription) return false;
    if (!sub?.isActive || !sub.endDate) return false;
    // Trial: ilk kez paket almayan işletme için aktif abonelik bitiş tarihine kadar ücretsiz
    return new Date(sub.endDate) >= new Date();
  }, [token, user, biz, sub]);

  const plans = useMemo(() => {
    const starter = {
      name: 'Başlangıç',
      price: isTrialActive ? '₺0' : '₺499',
      period: isTrialActive ? `/ ${TRIAL_DAYS} gün` : '/ay',
      description: 'Randevu yönetimi için hızlı başlangıç',
      features: [
        'Sınırsız randevu',
        'Hizmet ve personel yönetimi',
        'Müşteri paneli',
        'İşletme sayfası ve görünürlük',
      ],
      cta: isTrialActive ? 'Ücretsiz kullan' : 'Başla',
      highlighted: false,
    };

    const pro = {
      name: 'Pro',
      price: isTrialActive ? '₺0' : '₺999',
      period: isTrialActive ? `/ ${TRIAL_DAYS} gün` : '/ay',
      description: 'Gelişmiş özellikler ve otomasyon',
      features: [
        'Başlangıç paketindeki her şey',
        'Öncelikli destek',
        'WhatsApp bildirimleri (müşteri hatırlatma)',
        'Gelişmiş raporlama (yakında)',
        '1 adet ana sayfa reklam hakkı',
      ],
      cta: isTrialActive ? 'Ücretsiz kullan' : 'Pro’ya geç',
      highlighted: true,
    };

    return [starter, pro] as const;
  }, [isTrialActive]);

  const ctaHref = useMemo(() => {
    if (isOwner) return '/dashboard/business/subscription';
    return '/register?type=business_owner&from=/pricing';
  }, [isOwner]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 sm:text-4xl">Fiyatlar</h1>
        <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-300">
          İşletmeniz için uygun planı seçin. İstediğiniz zaman iptal edebilirsiniz.
        </p>
      </div>
      {isLoggedInCustomer && (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-semibold">İşletme paketi için işletme hesabı gerekir</p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
            Şu an bireysel (müşteri) hesabıyla giriş yaptınız. Paket satın almak ve işletme panelini kullanmak için işletme hesabı oluşturmalısınız.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/register?type=business_owner&from=/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              İşletme hesabı oluştur
            </Link>
            <Link
              href="/dashboard/customer/reservations"
              className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-transparent dark:text-amber-100 dark:hover:bg-amber-900/20"
            >
              Müşteri paneline dön
            </Link>
          </div>
        </div>
      )}
      <div className="mt-12 grid gap-8 md:mx-auto md:max-w-4xl md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.highlighted ? 'ring-2 ring-primary-500 shadow-soft' : ''}`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-3 py-0.5 text-xs font-medium text-white">
                Önerilen
              </span>
            )}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">{plan.name}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{plan.description}</p>
              <p className="mt-3 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                {plan.price}
                {plan.period ? (
                  <span className="text-base font-normal text-neutral-500 dark:text-neutral-400">{plan.period}</span>
                ) : null}
              </p>
            </div>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary-500" strokeWidth={2.5} aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <Link
              href={ctaHref}
              className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition ${
                plan.highlighted
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'border-2 border-neutral-300 bg-white text-neutral-700 hover:border-primary-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-primary-500'
              }`}
            >
              {plan.cta}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

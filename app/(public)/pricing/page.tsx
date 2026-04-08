import Link from 'next/link';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const plans = [
  {
    name: 'Aylık',
    price: '₺299',
    period: '/ay',
    description: 'Küçük işletmeler ve deneme için',
    features: ['Sınırsız randevu', 'Hizmet ve personel yönetimi', 'Müşteri paneli', 'E-posta desteği'],
    cta: 'Başla',
    highlighted: false,
  },
  {
    name: 'Yıllık',
    price: '₺2.990',
    period: '/yıl',
    description: 'En çok tercih edilen',
    features: ['Aylık planın tüm özellikleri', '2 ay ücretsiz', 'Öncelikli destek', 'Raporlama'],
    cta: 'Seç',
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Fiyatlar</h1>
        <p className="mt-2 text-lg text-neutral-600">
          İşletmeniz için uygun planı seçin. İstediğiniz zaman iptal edebilirsiniz.
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2 md:max-w-4xl md:mx-auto">
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
              <h2 className="text-xl font-semibold text-neutral-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-neutral-600">{plan.description}</p>
              <p className="mt-3 text-3xl font-bold text-neutral-900">
                {plan.price}
                <span className="text-base font-normal text-neutral-500">{plan.period}</span>
              </p>
            </div>
            <ul className="space-y-2 text-sm text-neutral-700">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary-500" strokeWidth={2.5} aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.highlighted ? '/register' : '/register'}
              className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition ${
                plan.highlighted
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'border-2 border-neutral-300 text-neutral-700 hover:border-primary-400'
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

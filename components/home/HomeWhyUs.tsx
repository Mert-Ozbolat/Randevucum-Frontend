'use client';

import { CheckCircle2, MessageSquareHeart, ShieldCheck, Zap } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';

const FEATURES = [
  {
    title: 'Hızlı Randevu',
    text: 'Müsait saatleri anında görün ve saniyeler içinde rezervasyon oluşturun.',
    Icon: Zap,
  },
  {
    title: 'Güvenilir İşletmeler',
    text: 'Doğrulanmış profiller ve şeffaf hizmet bilgileriyle güvenle seçim yapın.',
    Icon: ShieldCheck,
  },
  {
    title: 'Gerçek Kullanıcı Yorumları',
    text: 'Puanlar ve yorumlar gerçek müşteri deneyimlerinden gelir.',
    Icon: MessageSquareHeart,
  },
  {
    title: 'Anında Onay',
    text: 'Randevunuz oluşur oluşmaz onaylanır; panelden takip edersiniz.',
    Icon: CheckCircle2,
  },
] as const;

export function HomeWhyUs() {
  return (
    <AnimateIn as="section" animation="slide-up">
      <HomeSectionHeader
        eyebrow="Avantajlar"
        title="Neden Randevucum?"
        description="Premium, sade ve hızlı bir randevu deneyimi."
        align="center"
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ title, text, Icon }, i) => (
          <AnimateIn key={title} animation="slide-up" delay={i * 70}>
            <div className="h-full rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-300">
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{text}</p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </AnimateIn>
  );
}

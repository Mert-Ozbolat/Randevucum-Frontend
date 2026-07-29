'use client';

import { Star } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';

const TESTIMONIALS = [
  {
    name: 'Elif K.',
    city: 'Lefkoşa',
    initials: 'EK',
    text: 'Kuaför randevumu iki dakikada aldım. Saatleri net görmek çok rahatlatıcı.',
  },
  {
    name: 'Mert A.',
    city: 'Girne',
    initials: 'MA',
    text: 'Diş kliniği için uygun slotu bulmak eskiden zordu. Şimdi tek ekrandan hallediyorum.',
  },
  {
    name: 'Selin D.',
    city: 'Gazimağusa',
    initials: 'SD',
    text: 'Favorilerim sayesinde her seferinde aynı salona hızlıca randevu açıyorum.',
  },
] as const;

export function HomeTestimonials() {
  return (
    <AnimateIn as="section" animation="slide-up" aria-labelledby="home-reviews-title">
      <HomeSectionHeader
        eyebrow="Yorumlar"
        title="Gerçek kullanıcı deneyimleri"
        description="Randevucum kullananların paylaştığı kısa notlar."
        align="center"
        titleId="home-reviews-title"
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <AnimateIn key={t.name} animation="scale-in" delay={i * 70}>
            <figure className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                  aria-hidden
                >
                  {t.initials}
                </span>
                <div>
                  <figcaption className="font-semibold text-neutral-900 dark:text-neutral-50">
                    {t.name}
                  </figcaption>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.city}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-0.5 text-primary-500" aria-label="5 üzerinden 5 yıldız">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-current" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                “{t.text}”
              </blockquote>
            </figure>
          </AnimateIn>
        ))}
      </div>
    </AnimateIn>
  );
}

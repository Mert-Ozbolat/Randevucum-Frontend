'use client';

import Link from 'next/link';
import { ArrowRight, Check, Search, Sparkles } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { HomeLiveStats } from '@/components/home/HomeLiveStats';
import { HeroPromoCarousel } from '@/components/home/HeroPromoCarousel';
import type { HeroSlide } from '@/lib/homeHeroSlides';

const TRUST_POINTS = ['Hızlı randevu', 'Ücretsiz kullanım', 'Onaylı işletmeler'] as const;

interface HomeHeroProps {
  slides: HeroSlide[];
}

export function HomeHero({ slides }: HomeHeroProps) {
  return (
    <section className="relative -mx-4 px-4 pb-14 pt-6 sm:-mx-6 sm:px-6 sm:pb-16 lg:-mx-8 lg:px-8 lg:pb-20 lg:pt-10">
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-12 xl:gap-14">
        <div className="max-w-xl lg:max-w-none">
          <AnimateIn immediate animation="fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-700 shadow-sm backdrop-blur-sm dark:border-primary-800/60 dark:bg-primary-950/40 dark:text-primary-300">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              KKTC&apos;nin randevu platformu
            </span>
          </AnimateIn>

          <AnimateIn immediate animation="slide-up" delay={80}>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              Dakikalar içinde randevu alın
            </h1>
          </AnimateIn>

          <AnimateIn immediate animation="slide-up" delay={160}>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
              Kuaförden kliniğe, tek yerden müsait saatleri görün. Ücretsiz kayıt olun, favorilerinizi
              kaydedin, randevunuzu saniyeler içinde oluşturun.
            </p>
          </AnimateIn>

          <AnimateIn immediate animation="slide-up" delay={220}>
            <Link
              href="/business"
              className="group mt-8 flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white/90 px-4 py-3.5 shadow-card backdrop-blur-sm transition duration-300 hover:border-primary-300 hover:shadow-soft dark:border-neutral-600 dark:bg-neutral-800/90 dark:hover:border-primary-600"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
                <Search className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <span className="flex-1 text-left text-sm text-neutral-500 dark:text-neutral-400">
                İşletme, hizmet veya kategori ara…
              </span>
              <ArrowRight className="h-4 w-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-primary-600 dark:group-hover:text-primary-400" aria-hidden />
            </Link>
          </AnimateIn>

          <AnimateIn immediate animation="slide-up" delay={280}>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-300 hover:bg-primary-600 hover:shadow-glow active:scale-[0.98] sm:text-base sm:px-7 sm:py-3.5"
              >
                Ücretsiz başlayın
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl border-2 border-neutral-200 bg-white/60 px-6 py-3 text-sm font-semibold text-neutral-800 backdrop-blur-sm transition duration-300 hover:border-primary-300 hover:bg-white dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-100 sm:text-base sm:px-7 sm:py-3.5"
              >
                İşletme paketleri
              </Link>
            </div>
          </AnimateIn>

          <AnimateIn immediate animation="fade-in" delay={360}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_POINTS.map((label) => (
                <li key={label} className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </AnimateIn>

          <AnimateIn immediate animation="slide-up" delay={420}>
            <HomeLiveStats />
          </AnimateIn>
        </div>

        <AnimateIn immediate animation="slide-in-right" delay={200} className="w-full lg:min-w-0">
          <HeroPromoCarousel slides={slides} />
        </AnimateIn>
      </div>
    </section>
  );
}

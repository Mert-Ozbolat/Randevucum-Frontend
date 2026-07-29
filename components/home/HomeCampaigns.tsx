'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';
import type { HeroSlide } from '@/lib/homeHeroSlides';

const AUTO_MS = 6500;

interface HomeCampaignsProps {
  slides: HeroSlide[];
}

export function HomeCampaigns({ slides }: HomeCampaignsProps) {
  const [index, setIndex] = useState(0);
  const len = slides.length;
  const safe = len ? ((index % len) + len) % len : 0;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!len) return;
      setIndex((i) => (i + dir + len) % len);
    },
    [len]
  );

  useEffect(() => {
    if (len <= 1) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % len), AUTO_MS);
    return () => window.clearInterval(t);
  }, [len]);

  if (!len) return null;

  const current = slides[safe];

  return (
    <AnimateIn as="section" animation="slide-up">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-400">
          Kampanyalar
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
          Öne çıkan fırsatlar
        </h2>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-900">
        {/* Green + purple blur — no photo */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-10 -top-16 h-56 w-56 rounded-full bg-primary-400/40 blur-3xl dark:bg-primary-500/25" />
          <div className="absolute -right-8 bottom-0 h-64 w-64 rounded-full bg-accent-400/40 blur-3xl dark:bg-accent-500/30" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-300/20 blur-3xl dark:bg-accent-600/20" />
        </div>

        <div className="relative flex min-h-[220px] flex-col justify-center px-6 py-12 sm:min-h-[260px] sm:px-12 lg:px-16">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`transition-opacity duration-500 ${
                i === safe ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'
              }`}
              aria-hidden={i !== safe}
            >
              {i === safe && (
                <Link href={slide.href} className="group block max-w-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                    {slide.badge}
                  </p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 transition group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300 sm:text-3xl lg:text-4xl">
                    {slide.title}
                  </p>
                  {slide.subtitle && (
                    <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300 sm:text-lg">
                      {slide.subtitle}
                    </p>
                  )}
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
                    İncele
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {len > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-200/80 bg-white/80 p-2 text-neutral-700 shadow-soft backdrop-blur-sm transition hover:bg-white dark:border-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-100"
              aria-label="Önceki kampanya"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-neutral-200/80 bg-white/80 p-2 text-neutral-700 shadow-soft backdrop-blur-sm transition hover:bg-white dark:border-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-100"
              aria-label="Sonraki kampanya"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === safe
                      ? 'w-6 bg-accent-500'
                      : 'w-2 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500'
                  }`}
                  aria-label={`Kampanya ${i + 1}`}
                  aria-current={i === safe ? 'true' : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <p className="sr-only">{current.title}</p>
    </AnimateIn>
  );
}

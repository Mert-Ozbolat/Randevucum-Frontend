'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { HeroSlide } from '@/lib/homeHeroSlides';

const AUTO_MS = 6500;

interface HeroPromoCarouselProps {
  slides: HeroSlide[];
}

export function HeroPromoCarousel({ slides }: HeroPromoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const len = slides.length;
  const safeIndex = len ? ((index % len) + len) % len : 0;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!len) return;
      setIndex((i) => (i + dir + len) % len);
    },
    [len]
  );

  useEffect(() => {
    if (len <= 1 || paused) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % len), AUTO_MS);
    return () => window.clearInterval(t);
  }, [len, paused]);

  useEffect(() => {
    if (index >= len) setIndex(0);
  }, [index, len]);

  const slideKey = slides.map((s) => s.id).join('|');
  useEffect(() => {
    setIndex(0);
  }, [slideKey]);

  if (!len) return null;

  const current = slides[safeIndex];

  return (
    <div
      className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Arka plan — yumuşak glow */}
      <div
        className="absolute -inset-3 animate-pulse-soft rounded-[2.25rem] bg-gradient-to-br from-primary-400/30 via-emerald-300/15 to-amber-200/25 blur-2xl dark:from-primary-600/25 dark:via-emerald-900/20 dark:to-amber-900/15"
        aria-hidden
      />

      <div className="relative">
        {/* Dış çerçeve — “kart” hissi */}
        <div className="overflow-hidden rounded-[2rem] bg-neutral-900/5 p-1.5 shadow-2xl shadow-neutral-900/15 ring-1 ring-black/[0.06] dark:bg-white/5 dark:shadow-black/50 dark:ring-white/10">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.65rem] sm:aspect-[5/6] lg:aspect-[4/5]">
            <div
              className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${safeIndex * 100}%)` }}
            >
              {slides.map((slide) => (
                <Link
                  key={slide.id}
                  href={slide.href}
                  className="relative h-full min-w-full shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
                  aria-label={`${slide.title} — ${slide.badge}`}
                >
                  {slide.image.startsWith('data:') || slide.image.startsWith('blob:') ? (
                    // eslint-disable-next-line @next/next/no-img-element -- yüklü base64 görselleri
                    <img
                      src={slide.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={slide.image}
                      alt=""
                      fill
                      priority={slide.id === slides[0].id}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, min(520px, 42vw)"
                    />
                  )}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/25 to-neutral-950/10"
                    aria-hidden
                  />
                  <div className="absolute left-0 right-0 top-4 flex justify-center px-4">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                      {slide.badge}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p className="text-lg font-bold leading-snug text-white drop-shadow-sm sm:text-xl">
                      {slide.title}
                    </p>
                    {slide.subtitle && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-white/85">{slide.subtitle}</p>
                    )}
                    <span className="mt-3 inline-flex items-center text-sm font-semibold text-primary-200">
                      Detaya git →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Kontroller */}
        {len > 1 && (
          <>
            <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2">
              <button
                type="button"
                onClick={() => go(-1)}
                className="rounded-full bg-black/40 p-2 text-white shadow-lg backdrop-blur-md transition hover:bg-black/55"
                aria-label="Önceki slayt"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
              <button
                type="button"
                onClick={() => go(1)}
                className="rounded-full bg-black/40 p-2 text-white shadow-lg backdrop-blur-md transition hover:bg-black/55"
                aria-label="Sonraki slayt"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/55"
                aria-label={paused ? 'Otomatik oynat' : 'Duraklat'}
              >
                {paused ? (
                  <Play className="h-4 w-4" strokeWidth={2} aria-hidden />
                ) : (
                  <Pause className="h-4 w-4" strokeWidth={2} aria-hidden />
                )}
              </button>
            </div>

            <div
              className="absolute bottom-3 left-1/2 z-10 flex max-w-[min(100%,14rem)] -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur-md"
              role="tablist"
              aria-label="Slayt seçimi"
            >
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIndex}
                  onClick={() => setIndex(i)}
                  className={`h-2 shrink-0 rounded-full transition-all ${
                    i === safeIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Slayt ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
        {len > 1
          ? 'Sponsor işletmeler ve platform önerileri — tıklayarak detaya gidin.'
          : `${current.title} — detay için görsele tıklayın.`}
      </p>
    </div>
  );
}

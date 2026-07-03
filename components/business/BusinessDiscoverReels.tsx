'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BUSINESS_TYPES } from '@/lib/constants';
import { BUSINESS_TYPE_LABELS } from '@/lib/businessCategories';
import {
  type DiscoverBusiness,
  getDiscoverVideoUrl,
} from '@/lib/businessDiscoverMedia';

export type DiscoverReelsVariant = 'immersive' | 'embedded';

interface BusinessDiscoverReelsProps {
  businesses: DiscoverBusiness[];
  variant?: DiscoverReelsVariant;
  showHeader?: boolean;
  className?: string;
}

function DiscoverSlide({
  business,
  variant,
  isActive,
  muted,
}: {
  business: DiscoverBusiness;
  variant: DiscoverReelsVariant;
  isActive: boolean;
  muted: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rating = business.averageRating ?? business.rating;
  const location = [business.address?.district, business.address?.city].filter(Boolean).join(', ');
  const category =
    BUSINESS_TYPE_LABELS[business.businessType] ||
    BUSINESS_TYPES[business.businessType] ||
    business.businessType;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted]);

  const slideClass =
    variant === 'immersive'
      ? 'h-[min(78dvh,720px)] w-[min(88vw,400px)] snap-center shrink-0'
      : 'h-[min(62dvh,520px)] w-[min(78vw,320px)] snap-center shrink-0';

  return (
    <article
      data-discover-slide
      className={`relative overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl ring-1 ring-white/10 ${slideClass}`}
    >
      <video
        ref={videoRef}
        src={getDiscoverVideoUrl(business)}
        poster={business.imageUrl || undefined}
        className="absolute inset-0 h-full w-full object-cover"
        muted={muted}
        loop
        playsInline
        preload={isActive ? 'auto' : 'metadata'}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <span className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur">
          {category}
        </span>
        <h3 className="mt-2 text-xl font-bold leading-tight">{business.name}</h3>
        {location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-white/85">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {location}
          </p>
        )}
        {rating != null && rating > 0 && (
          <p className="mt-1 flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            {(business.reviewCount ?? 0) > 0 && (
              <span className="text-white/70">({business.reviewCount} yorum)</span>
            )}
          </p>
        )}
        {business.description && variant === 'immersive' && (
          <p className="mt-2 line-clamp-2 text-sm text-white/80">{business.description}</p>
        )}
        <Link
          href={`/business/${business._id}`}
          className="pointer-events-auto mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-600"
        >
          Randevu al
        </Link>
      </div>
    </article>
  );
}

export function BusinessDiscoverReels({
  businesses,
  variant = 'embedded',
  showHeader = true,
  className = '',
}: BusinessDiscoverReelsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  const updateActiveSlide = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const slides = container.querySelectorAll<HTMLElement>('[data-discover-slide]');
    if (!slides.length) return;

    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;

    let best = 0;
    let bestDist = Infinity;
    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.left + rect.width / 2;
      const dist = Math.abs(slideCenter - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActiveIndex(best);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    updateActiveSlide();
    container.addEventListener('scroll', updateActiveSlide, { passive: true });
    return () => container.removeEventListener('scroll', updateActiveSlide);
  }, [businesses.length, updateActiveSlide]);

  const scrollBySlide = (dir: -1 | 1) => {
    const container = scrollRef.current;
    if (!container) return;
    const slide = container.querySelector<HTMLElement>('[data-discover-slide]');
    const gap = 16;
    const amount = (slide?.offsetWidth ?? 320) + gap;
    container.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  if (!businesses.length) return null;

  const isImmersive = variant === 'immersive';

  return (
    <section
      className={`${isImmersive ? 'bg-neutral-950 text-white' : ''} ${className}`}
      aria-label="İşletme keşfet videoları"
    >
      {showHeader && (
        <div className={`mb-5 flex flex-wrap items-end justify-between gap-3 ${isImmersive ? 'px-4 sm:px-6' : ''}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-400">
              Keşfet
            </p>
            <h2 className={`text-2xl font-bold ${isImmersive ? 'text-white' : 'text-neutral-900 dark:text-neutral-50'}`}>
              İşletmeleri izle
            </h2>
            <p className={`mt-1 text-sm ${isImmersive ? 'text-neutral-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
              Reels gibi yatay kaydır — sağa sola geç
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className={`rounded-full p-2.5 transition ${
                isImmersive
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'
              }`}
              aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            {!isImmersive && (
              <Link
                href="/business/discover"
                className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600"
              >
                Tümünü keşfet
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        {!isImmersive && businesses.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollBySlide(-1)}
              className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/95 p-2 shadow-lg transition hover:bg-white sm:flex dark:bg-neutral-800 dark:text-white"
              aria-label="Önceki"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBySlide(1)}
              className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/95 p-2 shadow-lg transition hover:bg-white sm:flex dark:bg-neutral-800 dark:text-white"
              aria-label="Sonraki"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className={`flex gap-4 overflow-x-auto overscroll-x-contain pb-2 scrollbar-hide snap-x snap-mandatory ${
            isImmersive ? 'px-4 sm:px-6' : '-mx-1 px-1'
          }`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {businesses.map((b, i) => (
            <DiscoverSlide
              key={b._id}
              business={b}
              variant={variant}
              isActive={i === activeIndex}
              muted={muted}
            />
          ))}
        </div>

        {businesses.length > 1 && (
          <div className={`mt-4 flex justify-center gap-1.5 ${isImmersive ? '' : ''}`}>
            {businesses.map((b, i) => (
              <span
                key={b._id}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex
                    ? 'w-6 bg-primary-500'
                    : `w-1.5 ${isImmersive ? 'bg-white/30' : 'bg-neutral-300 dark:bg-neutral-600'}`
                }`}
                aria-hidden
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

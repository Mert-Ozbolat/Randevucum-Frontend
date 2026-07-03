'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Eye,
  MapPin,
  Share2,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BUSINESS_TYPES } from '@/lib/constants';
import { BUSINESS_TYPE_LABELS } from '@/lib/businessCategories';
import {
  type DiscoverBusiness,
  formatViewCount,
  getDiscoverVideoUrl,
  recordDiscoverVideoView,
} from '@/lib/businessDiscoverMedia';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

interface BusinessDiscoverFeedProps {
  businesses: DiscoverBusiness[];
}

function FeedSlide({
  business,
  isActive,
  muted,
  viewCount,
  onShare,
  onViewRecorded,
}: {
  business: DiscoverBusiness;
  isActive: boolean;
  muted: boolean;
  viewCount: number;
  onShare: (b: DiscoverBusiness) => void;
  onViewRecorded: (id: string, views: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const slideRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rating = business.averageRating ?? business.rating;
  const location = [business.address?.district, business.address?.city].filter(Boolean).join(', ');
  const category =
    BUSINESS_TYPE_LABELS[business.businessType] ||
    BUSINESS_TYPES[business.businessType] ||
    business.businessType;
  const videoSrc = getDiscoverVideoUrl(business);
  const caption = business.promoVideoCaption?.trim() || business.description;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
      setProgress(0);
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;
    const onTime = () => {
      if (video.duration) setProgress(video.currentTime / video.duration);
    };
    video.addEventListener('timeupdate', onTime);
    return () => video.removeEventListener('timeupdate', onTime);
  }, [isActive]);

  useEffect(() => {
    if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
    if (!isActive) return;

    viewTimerRef.current = setTimeout(() => {
      void recordDiscoverVideoView(business._id).then((views) => {
        if (views != null) onViewRecorded(business._id, views);
      });
    }, 2500);

    return () => {
      if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
    };
  }, [isActive, business._id, onViewRecorded]);

  if (!videoSrc) return null;

  return (
    <section
      ref={slideRef}
      data-feed-slide
      className="relative h-[100dvh] w-full shrink-0 snap-start snap-always overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src={videoSrc}
        poster={business.imageUrl || undefined}
        className="absolute inset-0 h-full w-full object-cover"
        muted={muted}
        loop
        playsInline
        preload={isActive ? 'auto' : 'metadata'}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

      {isActive && (
        <div className="absolute inset-x-0 top-0 z-20 h-0.5 bg-white/15">
          <div
            className="h-full bg-white/90 transition-[width] duration-150 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Sağ aksiyon şeridi */}
      <div className="absolute bottom-[max(6rem,18dvh)] right-3 z-30 flex flex-col items-center gap-5 sm:right-5">
        <div className="pointer-events-auto">
          <FavoriteButton
            businessId={business._id}
            size="sm"
            className="!h-12 !w-12 !border-0 !bg-black/35 !text-white backdrop-blur-md hover:!bg-black/50"
          />
        </div>

        <div className="flex flex-col items-center gap-1 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/35 backdrop-blur-md">
            <Eye className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <span className="text-xs font-semibold drop-shadow">{formatViewCount(viewCount)}</span>
        </div>

        <button
          type="button"
          onClick={() => onShare(business)}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50"
          aria-label="Paylaş"
        >
          <Share2 className="h-5 w-5" strokeWidth={2} />
        </button>

        <Link
          href={`/business/${business._id}/reserve`}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-400"
          aria-label="Randevu al"
        >
          <Calendar className="h-5 w-5" strokeWidth={2} />
        </Link>
      </div>

      {/* Alt bilgi */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16 pr-20 sm:px-6 sm:pr-24">
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {category}
        </span>
        <h2 className="mt-2 text-2xl font-bold leading-tight text-white drop-shadow-sm">
          {business.name}
        </h2>
        {location && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {location}
          </p>
        )}
        {rating != null && rating > 0 && (
          <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            {(business.reviewCount ?? 0) > 0 && (
              <span className="text-white/70">({business.reviewCount} yorum)</span>
            )}
          </p>
        )}
        {caption && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/85">{caption}</p>
        )}
        <Link
          href={`/business/${business._id}`}
          className="pointer-events-auto mt-4 inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-neutral-900 shadow-lg transition hover:bg-neutral-100"
        >
          İşletmeyi gör · Randevu al
        </Link>
      </div>
    </section>
  );
}

export function BusinessDiscoverFeed({ businesses }: BusinessDiscoverFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [shareHint, setShareHint] = useState('');
  const [viewCounts, setViewCounts] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    businesses.forEach((b) => {
      map[b._id] = b.promoVideoViews ?? 0;
    });
    return map;
  });

  const playable = businesses.filter((b) => getDiscoverVideoUrl(b));

  useEffect(() => {
    setViewCounts((prev) => {
      const next = { ...prev };
      businesses.forEach((b) => {
        if (next[b._id] === undefined) next[b._id] = b.promoVideoViews ?? 0;
      });
      return next;
    });
  }, [businesses]);

  const updateActiveSlide = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const slides = container.querySelectorAll<HTMLElement>('[data-feed-slide]');
    if (!slides.length) return;

    const mid = container.scrollTop + container.clientHeight / 2;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((slide, i) => {
      const center = slide.offsetTop + slide.offsetHeight / 2;
      const dist = Math.abs(center - mid);
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
  }, [playable.length, updateActiveSlide]);

  const handleViewRecorded = useCallback((id: string, views: number) => {
    setViewCounts((prev) => ({ ...prev, [id]: views }));
  }, []);

  const handleShare = async (business: DiscoverBusiness) => {
    const url = `${window.location.origin}/business/${business._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: business.name, text: `${business.name} — Randevucum Keşfet`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareHint('Link kopyalandı');
        setTimeout(() => setShareHint(''), 2000);
      }
    } catch {
      /* iptal */
    }
  };

  if (!playable.length) return null;

  const showSwipeHint = activeIndex === 0 && playable.length > 1;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
      {/* Üst bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
        <Link
          href="/business"
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/55"
          aria-label="Geri"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div className="pointer-events-none text-center">
          <p className="text-sm font-bold tracking-wide">Keşfet</p>
          {shareHint && <p className="text-xs text-primary-300">{shareHint}</p>}
        </div>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/55"
          aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </header>

      {/* Dikey tam ekran akış */}
      <div
        ref={scrollRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {playable.map((b, i) => (
          <FeedSlide
            key={b._id}
            business={b}
            isActive={i === activeIndex}
            muted={muted}
            viewCount={viewCounts[b._id] ?? b.promoVideoViews ?? 0}
            onShare={handleShare}
            onViewRecorded={handleViewRecorded}
          />
        ))}
      </div>

      {showSwipeHint && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-40 flex -translate-x-1/2 animate-bounce flex-col items-center gap-1 text-white/70">
          <ChevronDown className="h-6 w-6" strokeWidth={2} aria-hidden />
          <span className="text-xs font-medium">Sonraki video</span>
        </div>
      )}

      {playable.length > 1 && (
        <div className="pointer-events-none absolute right-1.5 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-1">
          {playable.map((b, i) => (
            <span
              key={b._id}
              className={`block rounded-full transition-all ${
                i === activeIndex ? 'h-5 w-1 bg-white' : 'h-1 w-1 bg-white/35'
              }`}
              aria-hidden
            />
          ))}
        </div>
      )}
    </div>
  );
}

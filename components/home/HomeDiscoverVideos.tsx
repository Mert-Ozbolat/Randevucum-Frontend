"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clapperboard, Eye, Play } from "lucide-react";
import { api } from "@/lib/api";
import { AnimateIn } from "@/components/ui/AnimateIn";
import {
  type DiscoverBusiness,
  formatViewCount,
  getDiscoverVideoUrl,
} from "@/lib/businessDiscoverMedia";

function DiscoverVideoCard({ business }: { business: DiscoverBusiness }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovering, setHovering] = useState(false);
  const videoSrc = getDiscoverVideoUrl(business);
  const views = business.promoVideoViews ?? 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hovering) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [hovering]);

  if (!videoSrc) return null;

  return (
    <Link
      href="/business/discover"
      className="group relative block shrink-0 snap-start"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative h-[280px] w-[168px] overflow-hidden rounded-2xl bg-neutral-900 shadow-lg ring-1 ring-black/10 transition duration-300 group-hover:scale-[1.03] group-hover:shadow-xl sm:h-[320px] sm:w-[180px]">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={business.imageUrl || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

        {!hovering && (
          <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition group-hover:scale-110">
            <Play className="ml-0.5 h-5 w-5 fill-white" aria-hidden />
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="line-clamp-2 text-sm font-bold leading-tight text-white">
            {business.name}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-white/80">
            <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {formatViewCount(views)} izlenme
          </p>
        </div>
      </div>
    </Link>
  );
}

export function HomeDiscoverVideos() {
  const [videos, setVideos] = useState<DiscoverBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: DiscoverBusiness[] }>("/business/discover", {
        params: { limit: 5 },
      })
      .then((res) => setVideos(res.data.data || []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="rounded-3xl border border-neutral-200/80 bg-neutral-950 p-6 sm:p-8 dark:border-neutral-700/80">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-800" />
        <div className="mt-6 flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[280px] w-[168px] shrink-0 animate-pulse rounded-2xl bg-neutral-800 sm:h-[320px] sm:w-[180px]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (videos.length === 0) return null;

  return (
    <AnimateIn
      as="section"
      animation="slide-up"
      className="overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/30 p-6 shadow-card sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-400">
            <Clapperboard className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Keşfet
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Son eklenen videolar
          </h2>
          <p className="mt-1 max-w-lg text-sm text-neutral-400">
            İşletmelerin paylaştığı tanıtım videoları — Reels gibi izleyin,
            ücretsiz.
          </p>
        </div>
        <Link
          href="/business/discover"
          className="shrink-0 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600"
        >
          Tümünü izle
        </Link>
      </div>

      <div
        className="mt-6 flex gap-4 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {videos.map((b) => (
          <DiscoverVideoCard key={b._id} business={b} />
        ))}
      </div>
    </AnimateIn>
  );
}

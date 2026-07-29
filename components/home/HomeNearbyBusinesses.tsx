"use client";

import { useEffect, useMemo, useState } from "react";
import { LocateFixed } from "lucide-react";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { BusinessCard } from "@/components/business/BusinessCard";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { HomeNearbyMap } from "@/components/home/HomeNearbyMap";
import { Button } from "@/components/ui/Button";
import { KKTC_CITIES } from "@/lib/constants";
import type { HomeBusiness } from "@/components/home/HomeFeaturedBusinesses";

interface Props {
  businesses: HomeBusiness[];
  loading: boolean;
  error: boolean;
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function HomeNearbyBusinesses({ businesses, loading, error }: Props) {
  const [city, setCity] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoError, setGeoError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("homeSearchCity");
      if (saved) setCity(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoError(false);
      },
      () => setGeoError(true),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const nearby = useMemo(() => {
    let list = [...businesses];

    if (city) {
      list = list.filter((b) => b.address?.city === city);
    }

    const ranked = list.map((b) => {
      const lat = b.location?.lat;
      const lng = b.location?.lng;
      const distanceKm =
        coords && typeof lat === "number" && typeof lng === "number"
          ? haversineKm(coords, { lat, lng })
          : Number.POSITIVE_INFINITY;
      return { ...b, distanceKm };
    });

    if (coords) {
      ranked.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return ranked;
  }, [businesses, city, coords]);

  const mapBusinesses = useMemo(
    () =>
      nearby
        .filter(
          (b) =>
            typeof b.location?.lat === "number" &&
            typeof b.location?.lng === "number",
        )
        .slice(0, 40),
    [nearby],
  );

  const cardBusinesses = useMemo(() => nearby.slice(0, 6), [nearby]);

  return (
    <AnimateIn
      as="section"
      animation="slide-up"
      aria-labelledby="home-nearby-title"
    >
      <HomeSectionHeader
        eyebrow="Yakınında"
        title="Yakındaki işletmeler"
        description="Konumunuza veya seçtiğiniz şehre göre en yakın işletmeleri haritada görün."
        href="/business"
        linkLabel="Tüm işletmeler"
        titleId="home-nearby-title"
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={requestLocation}
        >
          <LocateFixed className="mr-1.5 h-4 w-4" aria-hidden />
          Konumumu kullan
        </Button>
        {KKTC_CITIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCity((prev) => (prev === c ? "" : c))}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              city === c
                ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-300"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
            aria-pressed={city === c}
          >
            {c}
          </button>
        ))}
      </div>

      {geoError && (
        <p
          className="mt-3 text-sm text-neutral-500 dark:text-neutral-400"
          role="status"
        >
          Konum alınamadı. Şehir seçerek devam edebilirsiniz.
        </p>
      )}
      {coords && (
        <p
          className="mt-3 text-sm text-primary-600 dark:text-primary-400"
          role="status"
        >
          Konumunuza göre sıralandı.
        </p>
      )}

      {loading && (
        <div className="mt-8 space-y-6">
          <div className="h-[380px] animate-pulse rounded-3xl bg-neutral-200 dark:bg-neutral-700 sm:h-[420px]" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-200">
            İşletmeler yüklenemedi.
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-8 space-y-8">
          <HomeNearbyMap
            businesses={mapBusinesses}
            userCoords={coords}
            city={city}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {cardBusinesses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cardBusinesses.map((b, i) => (
                <AnimateIn key={b._id} animation="slide-up" delay={i * 50}>
                  <div
                    className={
                      selectedId === b._id
                        ? "rounded-3xl ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-neutral-900"
                        : undefined
                    }
                    onMouseEnter={() => setSelectedId(b._id)}
                  >
                    <BusinessCard
                      _id={b._id}
                      name={b.name}
                      businessType={b.businessType}
                      address={b.address}
                      description={b.description}
                      imageUrl={b.imageUrl}
                      rating={b.averageRating ?? b.rating}
                      reviewCount={b.reviewCount}
                      isAvailableToday={b.isAvailableToday}
                    />
                  </div>
                </AnimateIn>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-8 py-12 text-center dark:border-neutral-600 dark:bg-neutral-800/50">
              <p className="text-neutral-600 dark:text-neutral-300">
                Bu filtreye uygun işletme bulunamadı. Şehir seçimini değiştirin
                veya tüm işletmelere göz atın.
              </p>
            </div>
          )}
        </div>
      )}
    </AnimateIn>
  );
}

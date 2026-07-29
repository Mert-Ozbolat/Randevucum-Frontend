'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { KKTC_CITY_CENTERS, KKTC_MAP_CENTER, loadGoogleMaps } from '@/lib/googleMaps';
import { colors } from '@/lib/colors';
import { getBusinessMapIconUrl, getUserLocationIconUrl } from '@/lib/mapBusinessIcons';
import type { HomeBusiness } from '@/components/home/HomeFeaturedBusinesses';

export type MapBusiness = HomeBusiness & {
  distanceKm?: number;
};

interface Props {
  businesses: MapBusiness[];
  userCoords?: { lat: number; lng: number } | null;
  city?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** dark band styling for empty overlay */
  tone?: 'light' | 'dark';
}

function hasCoords(b: MapBusiness): b is MapBusiness & { location: { lat: number; lng: number } } {
  return typeof b.location?.lat === 'number' && typeof b.location?.lng === 'number';
}

export function HomeNearbyMap({
  businesses,
  userCoords = null,
  city = '',
  selectedId = null,
  onSelect,
  tone = 'light',
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const infoRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  const withLocation = useMemo(() => businesses.filter(hasCoords), [businesses]);
  const markersKey = useMemo(
    () =>
      withLocation
        .map(
          (b) =>
            `${b._id}:${b.location.lat},${b.location.lng}:${b.businessType ?? ''}:${b.distanceKm ?? ''}`
        )
        .join('|'),
    [withLocation]
  );
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const businessesRef = useRef(withLocation);
  businessesRef.current = withLocation;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  useEffect(() => {
    if (!apiKey) {
      setError('Harita için Google Maps API anahtarı gerekli.');
      return;
    }
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError('Harita yüklenemedi.');
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  // Keep map mounted always — remounting caused black screen after empty city filter
  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) return;

    const pins = businessesRef.current;
    const cityCenter = city ? KKTC_CITY_CENTERS[city] : null;
    const center =
      userCoords ||
      cityCenter ||
      (pins[0] ? { lat: pins[0].location.lat, lng: pins[0].location.lng } : KKTC_MAP_CENTER);

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: userCoords || city ? 12 : 10,
        clickableIcons: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      });
      infoRef.current = new window.google.maps.InfoWindow();
    }

    const map = mapInstanceRef.current;
    const gMaps = window.google.maps;
    const existingIds = new Set(pins.map((b) => b._id));

    markersRef.current.forEach((marker, id) => {
      if (!existingIds.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    });

    const bounds = new gMaps.LatLngBounds();
    let hasPinBounds = false;

    pins.forEach((b) => {
      const pos = { lat: b.location.lat, lng: b.location.lng };
      bounds.extend(pos);
      hasPinBounds = true;

      const selected = selectedIdRef.current === b._id;
      const icon = {
        url: getBusinessMapIconUrl(b.businessType, selected),
        scaledSize: new gMaps.Size(selected ? 44 : 40, selected ? 44 : 40),
        anchor: new gMaps.Point(selected ? 22 : 20, selected ? 22 : 20),
      };

      let marker = markersRef.current.get(b._id);
      if (!marker) {
        marker = new gMaps.Marker({
          map,
          position: pos,
          title: b.name,
          icon,
        });
        marker.addListener('click', () => {
          const current = businessesRef.current.find((x) => x._id === b._id);
          onSelectRef.current?.(b._id);
          const dist =
            current && typeof current.distanceKm === 'number' && Number.isFinite(current.distanceKm)
              ? `<p style="margin:4px 0 0;font-size:12px;color:#737373">${current.distanceKm.toFixed(1)} km</p>`
              : '';
          infoRef.current?.setContent(
            `<div style="padding:4px 2px;max-width:200px;font-family:system-ui,sans-serif">
              <strong style="font-size:14px;color:#171717">${escapeHtml(current?.name || b.name)}</strong>
              ${dist}
              <a href="/business/${b._id}" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:600;color:${colors.primary[600]}">Detay →</a>
            </div>`
          );
          infoRef.current?.open({ map, anchor: marker });
        });
        markersRef.current.set(b._id, marker);
      } else {
        marker.setPosition(pos);
        marker.setIcon(icon);
        marker.setMap(map);
      }
    });

    if (userCoords) {
      bounds.extend(userCoords);
      const userIcon = {
        url: getUserLocationIconUrl(),
        scaledSize: new gMaps.Size(28, 28),
        anchor: new gMaps.Point(14, 14),
      };
      if (!userMarkerRef.current) {
        userMarkerRef.current = new gMaps.Marker({
          map,
          position: userCoords,
          title: 'Konumunuz',
          icon: userIcon,
          zIndex: 2000,
        });
      } else {
        userMarkerRef.current.setPosition(userCoords);
        userMarkerRef.current.setIcon(userIcon);
        userMarkerRef.current.setMap(map);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    if (hasPinBounds) {
      if (userCoords) bounds.extend(userCoords);
      map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
      const listener = gMaps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() > 14) map.setZoom(14);
      });
      return () => {
        gMaps.event.removeListener(listener);
      };
    }

    // Empty filter: keep map alive, pan to city / user / default (fixes black screen)
    map.setCenter(center);
    map.setZoom(cityCenter || userCoords ? 12 : 10);
  }, [ready, markersKey, userCoords, city]);

  useEffect(() => {
    if (!ready || !window.google?.maps) return;
    const gMaps = window.google.maps;
    markersRef.current.forEach((marker, id) => {
      const b = businessesRef.current.find((x) => x._id === id);
      const selected = selectedId === id;
      marker.setIcon({
        url: getBusinessMapIconUrl(b?.businessType, selected),
        scaledSize: new gMaps.Size(selected ? 44 : 40, selected ? 44 : 40),
        anchor: new gMaps.Point(selected ? 22 : 20, selected ? 22 : 20),
      });
      marker.setZIndex(selected ? 1000 : 1);
    });
  }, [ready, selectedId, markersKey]);

  useEffect(() => {
    if (!selectedId || !mapInstanceRef.current) return;
    const marker = markersRef.current.get(selectedId);
    if (!marker) return;
    const pos = marker.getPosition();
    if (pos) {
      mapInstanceRef.current.panTo(pos);
      if ((mapInstanceRef.current.getZoom() ?? 0) < 13) {
        mapInstanceRef.current.setZoom(13);
      }
    }
  }, [selectedId]);

  if (error) {
    return (
      <div
        className={`flex h-[280px] items-center justify-center rounded-3xl border border-dashed px-6 text-center sm:h-[380px] md:h-[420px] ${
          tone === 'dark'
            ? 'border-neutral-600 bg-neutral-800/50'
            : 'border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800/50'
        }`}
      >
        <div>
          <p className={`text-sm ${tone === 'dark' ? 'text-neutral-300' : 'text-neutral-600 dark:text-neutral-300'}`}>
            {error}
          </p>
          <Link href="/business" className="mt-2 inline-block text-sm font-semibold text-primary-500">
            Listeyi görüntüle
          </Link>
        </div>
      </div>
    );
  }

  const empty = ready && withLocation.length === 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 shadow-soft dark:border-neutral-700">
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <p className="text-sm text-neutral-500">Harita yükleniyor…</p>
        </div>
      )}

      {/* Always mounted — never unmount map div */}
      <div
        ref={mapRef}
        className="h-[280px] w-full bg-neutral-100 sm:h-[380px] md:h-[420px] dark:bg-neutral-800"
      />

      {empty && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center bg-neutral-900/45 px-6 backdrop-blur-[2px]">
          <p className="rounded-2xl bg-white/95 px-5 py-3 text-center text-sm font-medium text-neutral-700 shadow-soft dark:bg-neutral-900/95 dark:text-neutral-200">
            Bu filtrede haritada gösterilecek konumlu işletme yok.
            {city ? ` (${city})` : ''}
          </p>
        </div>
      )}

      {withLocation.length > 0 && (
        <p className="absolute bottom-3 left-3 z-[1] rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur dark:bg-neutral-900/90 dark:text-neutral-200">
          {withLocation.length} işletme haritada
          {userCoords ? ' · konumunuz kırmızı' : ''}
        </p>
      )}
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
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
  const t = useTranslations('home.nearby.map');
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
  const detailsLabelRef = useRef(t('details'));
  detailsLabelRef.current = t('details');
  const yourLocationRef = useRef(t('yourLocationTitle'));
  yourLocationRef.current = t('yourLocationTitle');

  useEffect(() => {
    if (!apiKey) {
      setError(t('apiKeyMissing'));
      return;
    }
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(t('loadFailed'));
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, t]);

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
          const current = businessesRef.current.find((x) => x._id === b._id) || b;
          onSelectRef.current?.(b._id);
          infoRef.current?.setContent(
            buildInfoWindowHtml(current, detailsLabelRef.current)
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
          title: yourLocationRef.current,
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
            {t('viewList')}
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
          <p className="text-sm text-neutral-500">{t('loading')}</p>
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
            {t('empty')}
            {city ? ` (${city})` : ''}
          </p>
        </div>
      )}

      {withLocation.length > 0 && (
        <p className="absolute bottom-3 left-3 z-[1] rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur dark:bg-neutral-900/90 dark:text-neutral-200">
          {t('countOnMap', { count: withLocation.length })}
          {userCoords ? ` · ${t('yourLocation')}` : ''}
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

const PLACEHOLDER_IMAGES: Record<string, string> = {
  hair_salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
  barber: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
  dental_clinic: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400',
  beauty_center: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
  other: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
};

function getBusinessCoverImage(b: MapBusiness): string {
  const url = b.imageUrl?.trim();
  if (url) return url;
  return PLACEHOLDER_IMAGES[b.businessType] || PLACEHOLDER_IMAGES.other;
}

function buildInfoWindowHtml(b: MapBusiness, detailsLabel: string): string {
  const cover = escapeHtml(getBusinessCoverImage(b));
  const name = escapeHtml(b.name);
  const location = [b.address?.district, b.address?.city].filter(Boolean).join(', ');
  const locationHtml = location
    ? `<p style="margin:4px 0 0;font-size:12px;color:#737373">${escapeHtml(location)}</p>`
    : '';
  const dist =
    typeof b.distanceKm === 'number' && Number.isFinite(b.distanceKm)
      ? `<p style="margin:4px 0 0;font-size:12px;color:#737373">${b.distanceKm.toFixed(1)} km</p>`
      : '';

  return `<div style="padding:4px 2px;max-width:220px;font-family:system-ui,sans-serif">
    <img
      src="${cover}"
      alt="${name}"
      style="display:block;width:100%;height:112px;object-fit:cover;border-radius:10px;margin-bottom:8px;background:#f5f5f5"
      loading="lazy"
    />
    <strong style="display:block;font-size:14px;line-height:1.3;color:#171717">${name}</strong>
    ${locationHtml}
    ${dist}
    <a href="/business/${escapeHtml(b._id)}" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:600;color:${colors.primary[600]}">${escapeHtml(detailsLabel)}</a>
  </div>`;
}

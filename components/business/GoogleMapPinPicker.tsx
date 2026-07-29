'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { KKTC_MAP_CENTER, loadGoogleMaps } from '@/lib/googleMaps';

type LatLng = { lat: number; lng: number } | null;

export function GoogleMapPinPicker({
  value,
  onChange,
}: {
  value?: { lat?: number; lng?: number } | null;
  onChange: (v: { lat: number; lng: number } | null) => void;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const normalizedValue: LatLng = useMemo(() => {
    const lat = value?.lat;
    const lng = value?.lng;
    if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
    return KKTC_MAP_CENTER;
  }, [value]);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps için API key eksik. Lütfen NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ekleyin.');
      return;
    }
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError('Google Maps yüklenemedi.');
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) return;

    const center = normalizedValue || KKTC_MAP_CENTER;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        clickableIcons: false,
        streetViewControl: false,
        mapTypeControl: false,
      });
    }

    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: center,
        map: mapInstanceRef.current,
      });
    } else {
      markerRef.current.setPosition(center);
    }

    const map = mapInstanceRef.current;
    const marker = markerRef.current;

    const clickListener = map.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const next = { lat, lng };
      marker.setPosition(next);
      onChangeRef.current(next);
    });

    return () => {
      window.google?.maps?.event?.removeListener(clickListener);
    };
  }, [ready, normalizedValue]);

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-sm font-medium text-neutral-900">Haritadan konum seç</p>
        <div className="text-xs text-neutral-600">Pin’e tıkla veya haritaya tıklayarak işaretle.</div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div
        ref={mapRef}
        className="h-72 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-soft"
      />

      {normalizedValue && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
          Seçilen koordinat: <span className="font-semibold">{normalizedValue.lat.toFixed(5)}</span>,{' '}
          <span className="font-semibold">{normalizedValue.lng.toFixed(5)}</span>
        </div>
      )}
    </div>
  );
}

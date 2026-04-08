'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type LatLng = { lat: number; lng: number } | null;

declare global {
  interface Window {
    google?: any;
  }
}

const DEFAULT_CENTER: LatLng = { lat: 35.1856, lng: 33.3823 }; // Lefkoşa (default)

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

  const normalizedValue: LatLng = useMemo(() => {
    const lat = value?.lat;
    const lng = value?.lng;
    if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
    return DEFAULT_CENTER;
  }, [value]);

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps için API key eksik. Lütfen NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ekleyin.');
      return;
    }

    // Load script once
    const existing = document.querySelector('script[data-google-maps-pin-picker="1"]') as HTMLScriptElement | null;
    if (!existing) {
      const script = document.createElement('script');
      script.setAttribute('data-google-maps-pin-picker', '1');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const interval = window.setInterval(() => {
      if (window.google?.maps) {
        window.clearInterval(interval);
      }
    }, 300);

    return () => window.clearInterval(interval);
  }, [apiKey]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!window.google?.maps) return;

    const center = normalizedValue || DEFAULT_CENTER;

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
      onChange(next);
    });

    return () => {
      window.google?.maps?.event?.removeListener(clickListener);
    };
  }, [normalizedValue, onChange]);

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-sm font-medium text-neutral-900">Haritadan konum seç</p>
        <div className="text-xs text-neutral-600">Pin’e tıkla veya haritaya tıklayarak işaretle.</div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

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


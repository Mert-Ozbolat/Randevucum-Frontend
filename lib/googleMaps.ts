/** Shared Google Maps JS loader (browser only). */

declare global {
  interface Window {
    google?: any;
  }
}

let loadPromise: Promise<typeof window.google> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<typeof window.google> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps only available in browser'));
  }
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-google-maps="1"]'
    ) as HTMLScriptElement | null;

    const onReady = () => {
      if (window.google?.maps) resolve(window.google);
      else reject(new Error('Google Maps failed to load'));
    };

    if (existing) {
      if (window.google?.maps) {
        onReady();
        return;
      }
      existing.addEventListener('load', onReady);
      existing.addEventListener('error', () => reject(new Error('Google Maps script error')));
      return;
    }

    const script = document.createElement('script');
    script.setAttribute('data-google-maps', '1');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error('Google Maps script error'));
    document.body.appendChild(script);
  });

  return loadPromise;
}

export const KKTC_MAP_CENTER = { lat: 35.1856, lng: 33.3823 }; // Lefkoşa

export const KKTC_CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  Lefkoşa: { lat: 35.1856, lng: 33.3823 },
  Girne: { lat: 35.3367, lng: 33.3143 },
  Gazimağusa: { lat: 35.1249, lng: 33.9402 },
  Güzelyurt: { lat: 35.1987, lng: 32.9932 },
  İskele: { lat: 35.2869, lng: 33.8917 },
  Lefke: { lat: 35.1117, lng: 32.8478 },
};

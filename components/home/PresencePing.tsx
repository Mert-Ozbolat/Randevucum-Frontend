'use client';

import { useEffect } from 'react';
import { pingPresence } from '@/lib/homeStats';

const PING_MS = 40_000;

/** Görünmez bileşen — tüm public sayfalarda aktif kullanıcı sayımı için ping atar. */
export function PresencePing() {
  useEffect(() => {
    let cancelled = false;

    const run = () => {
      if (!cancelled) pingPresence().catch(() => {});
    };

    run();
    const t = window.setInterval(run, PING_MS);

    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  return null;
}

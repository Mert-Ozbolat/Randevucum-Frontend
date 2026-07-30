'use client';

import { useEffect } from 'react';

/** Keşfet: tam ekran, sayfa kaydırması kapalı (footer/nav görünmez) */
export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
    };
  }, []);

  return <div className="fixed inset-0 z-[80] bg-black">{children}</div>;
}

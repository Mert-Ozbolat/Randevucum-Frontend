'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'randevucum-cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-neutral-200/90 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95 sm:p-5"
      role="dialog"
      aria-label="Çerez bildirimi"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50">
            <Cookie className="h-5 w-5 text-amber-700 dark:text-amber-400" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Çerez kullanımı</p>
            <p className="mt-0.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Oturum ve temel işlevler için gerekli çerezler kullanıyoruz. Detaylar için{' '}
              <Link href="/cookies" className="font-medium text-primary-600 underline-offset-2 hover:underline dark:text-primary-400">
                Çerez Politikası
              </Link>{' '}
              ve{' '}
              <Link href="/privacy" className="font-medium text-primary-600 underline-offset-2 hover:underline dark:text-primary-400">
                Gizlilik Politikası
              </Link>
              ’nı inceleyebilirsiniz.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:ml-4">
          <button
            type="button"
            onClick={accept}
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 dark:bg-primary-500"
          >
            Kabul ediyorum
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

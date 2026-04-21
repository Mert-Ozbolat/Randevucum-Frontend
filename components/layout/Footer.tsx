'use client';

import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white/80 py-10 dark:border-neutral-700 dark:bg-neutral-900/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo size="sm" href="/" />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
            <Link
              href="/privacy"
              className="text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-300"
            >
              Gizlilik Politikası
            </Link>
          </nav>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          © {new Date().getFullYear()} Randevucum. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}


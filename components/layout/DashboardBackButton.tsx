'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface DashboardBackButtonProps {
  /** Geçmiş yoksa veya geri gidilemiyorsa (ör. yeni sekme) nereye gideceği */
  fallbackHref: string;
}

export function DashboardBackButton({ fallbackHref }: DashboardBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
      Geri
    </button>
  );
}

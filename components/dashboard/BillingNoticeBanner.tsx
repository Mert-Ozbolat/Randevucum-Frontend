'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  message: string;
  inGracePeriod?: boolean;
  onOpenPortal?: () => void;
  portalLoading?: boolean;
};

export function BillingNoticeBanner({ message, inGracePeriod, onOpenPortal, portalLoading }: Props) {
  return (
    <div
      role="alert"
      className="border-b border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/50 sm:px-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
              {inGracePeriod ? 'Ödeme sorunu — ek süre tanımlandı' : 'Abonelik uyarısı'}
            </p>
            <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-100/90">{message}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {onOpenPortal && (
            <Button type="button" variant="outline" size="sm" loading={portalLoading} onClick={onOpenPortal}>
              Ödeme yöntemini güncelle
            </Button>
          )}
          <Link href="/dashboard/business/subscription">
            <Button type="button" size="sm">
              Aboneliğe git
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

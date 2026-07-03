'use client';

import Link from 'next/link';
import { AlertTriangle, XCircle } from 'lucide-react';
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

type SuspendedProps = {
  message?: string;
  onOpenPortal?: () => void;
  portalLoading?: boolean;
};

export function BillingSuspendedBanner({ message, onOpenPortal, portalLoading }: SuspendedProps) {
  return (
    <div
      role="alert"
      className="border-b border-red-300 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/50 sm:px-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700 dark:text-red-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-red-950 dark:text-red-100">İşletme offline</p>
            <p className="mt-1 text-sm text-red-900/90 dark:text-red-100/90">
              {message ||
                'Aboneliğiniz askıda. Keşfet, liste ve randevu kapalı. Ödemeyi düzelterek tekrar yayına alın.'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {onOpenPortal && (
            <Button type="button" size="sm" loading={portalLoading} onClick={onOpenPortal}>
              Ödemeyi güncelle
            </Button>
          )}
          <Link href="/dashboard/business/subscription">
            <Button type="button" variant="outline" size="sm">
              Abonelik
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

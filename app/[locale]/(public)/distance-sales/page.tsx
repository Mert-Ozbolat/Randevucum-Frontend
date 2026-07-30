import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LEGAL_PAGES } from '@/lib/legal/content';
import { LEGAL } from '@/lib/legal/constants';

export const metadata: Metadata = {
  title: `Mesafeli Satış Sözleşmesi | ${LEGAL.platformName}`,
  description: 'İşletme abonelik paketleri için mesafeli satış sözleşmesi.',
};

export default function DistanceSalesPage() {
  return <LegalPageLayout content={LEGAL_PAGES['distance-sales']} />;
}

import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LEGAL_PAGES } from '@/lib/legal/content';
import { LEGAL } from '@/lib/legal/constants';

export const metadata: Metadata = {
  title: `Çerez Politikası | ${LEGAL.platformName}`,
  description: 'Randevucum çerez politikası — hangi çerezlerin kullanıldığını öğrenin.',
};

export default function CookiesPage() {
  return <LegalPageLayout content={LEGAL_PAGES.cookies} />;
}

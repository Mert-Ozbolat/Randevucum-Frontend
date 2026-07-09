import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LEGAL_PAGES } from '@/lib/legal/content';
import { LEGAL } from '@/lib/legal/constants';

export const metadata: Metadata = {
  title: `Kullanım Koşulları | ${LEGAL.platformName}`,
  description: 'Randevucum platform kullanım koşulları ve kullanıcı yükümlülükleri.',
};

export default function TermsPage() {
  return <LegalPageLayout content={LEGAL_PAGES.terms} />;
}

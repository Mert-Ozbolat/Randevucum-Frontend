import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LEGAL_PAGES } from '@/lib/legal/content';
import { LEGAL } from '@/lib/legal/constants';

export const metadata: Metadata = {
  title: `Gizlilik Politikası | ${LEGAL.platformName}`,
  description: 'Randevucum gizlilik politikası — kişisel verilerinizin nasıl işlendiğini öğrenin.',
};

export default function PrivacyPolicyPage() {
  return <LegalPageLayout content={LEGAL_PAGES.privacy} />;
}

import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LEGAL_PAGES } from '@/lib/legal/content';
import { LEGAL } from '@/lib/legal/constants';

export const metadata: Metadata = {
  title: `İptal ve İade Politikası | ${LEGAL.platformName}`,
  description: 'Abonelik iptali, iade koşulları ve randevu iptal kuralları.',
};

export default function RefundPolicyPage() {
  return <LegalPageLayout content={LEGAL_PAGES['refund-policy']} />;
}

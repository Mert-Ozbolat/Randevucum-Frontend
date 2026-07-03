/** Aktif ücretsiz deneme varken satın alma kapalı */
export function isTrialBlockingPurchase(sub?: {
  isTrial?: boolean;
  isActive?: boolean;
  trialExpired?: boolean;
  stripeSubscriptionId?: string | null;
} | null): boolean {
  return Boolean(
    sub?.isTrial && sub.isActive && !sub.trialExpired && !sub.stripeSubscriptionId
  );
}

export const PLAN_FEATURES = {
  standard: [
    'Ayda 30 randevu',
    'En fazla 1 personel',
    'Hizmet yönetimi',
    'Müşteri paneli',
    'İşletme sayfası ve görünürlük',
  ],
  pro: [
    'Başlangıç paketindeki her şey',
    'Sınırsız randevu',
    'Sınırsız personel',
    'WhatsApp bildirimleri (müşteri + işletme)',
    'Öncelikli destek',
    'Keşfet’e video paylaşma',
    'Gelişmiş raporlama (yakında)',
  ],
} as const;

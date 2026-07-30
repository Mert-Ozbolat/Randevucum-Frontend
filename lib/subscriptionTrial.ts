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

export const PLAN_FEATURES = [
  'Sınırsız randevu',
  'Sınırsız personel',
  'WhatsApp bildirimleri (müşteri + işletme)',
  'Hizmet ve takvim yönetimi',
  'İşletme sayfası ve Keşfet görünürlüğü',
  'Keşfet’e video paylaşma',
  'Öncelikli destek',
] as const;

/** @deprecated Tek paket — geriye dönük uyumluluk */
export const PLAN_FEATURES_LEGACY = {
  pro: [...PLAN_FEATURES],
} as const;

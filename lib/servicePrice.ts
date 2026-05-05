/**
 * Hizmet fiyat gösterimi — sabit fiyat (legacy) veya min/max aralığı.
 */

export type ServicePriceFields = {
  price?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string | null;
};

export function formatServicePriceLabel(s: ServicePriceFields): string | null {
  const sym = !s.currency || s.currency === 'TRY' ? '₺' : s.currency;
  const min = s.priceMin != null && Number(s.priceMin) >= 0 ? Number(s.priceMin) : null;
  const max = s.priceMax != null && Number(s.priceMax) >= 0 ? Number(s.priceMax) : null;
  const legacy = s.price != null && Number(s.price) > 0 ? Number(s.price) : null;

  if (min != null && max != null) {
    if (min === max) return `${min} ${sym}`;
    return `${min} – ${max} ${sym}`;
  }
  if (min != null) return `${min} ${sym} ve üzeri`;
  if (max != null) return `En fazla ${max} ${sym}`;
  if (legacy != null) return `${legacy} ${sym}`;
  return null;
}

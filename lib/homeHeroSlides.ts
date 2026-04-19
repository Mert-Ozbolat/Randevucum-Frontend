/**
 * Ana sayfa hero slider: platform tanıtım slaytları + ücretli işletme reklamları (API).
 */
export type HeroSlide = {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  href: string;
  /** Küçük etiket: "Platform" / "İşletme" vb. */
  badge: string;
};

/** Yüksek çözünürlüklü, randevu / hizmet temalı görseller */
export const HOME_PLATFORM_SLIDES: HeroSlide[] = [
  {
    id: 'platform-1',
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=85',
    title: 'Sağlık ve bakım tek yerde',
    subtitle: 'Klinikten güzellik merkezine güvenle randevu alın.',
    href: '/business?area=Sağlık',
    badge: 'Keşfet',
  },
  {
    id: 'platform-2',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=85',
    title: 'Güzellik ve profesyonel hizmet',
    subtitle: 'Kuaför, SPA ve estetik için müsait saatleri görün.',
    href: '/business?area=Güzellik%20%26%20Bakım',
    badge: 'Keşfet',
  },
  {
    id: 'platform-3',
    image:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=85',
    title: 'Eğitim ve danışmanlık',
    subtitle: 'Ders ve seanslar için online rezervasyon.',
    href: '/business?area=Eğitim',
    badge: 'Keşfet',
  },
  {
    id: 'platform-4',
    image:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=85',
    title: 'İşletmenizi büyütün',
    subtitle: 'Müşterilerinize 7/24 online randevu sunun.',
    href: '/pricing',
    badge: 'İşletmelere özel',
  },
];

/** GET /business/home-slider-ads yanıtı */
export type PaidSliderAdApi = {
  businessId: string;
  headline: string;
  subline?: string;
  imageUrl: string;
  hrefPath: string;
};

export function mapPaidSliderAdsToSlides(ads: PaidSliderAdApi[]): HeroSlide[] {
  return ads.map((a) => ({
    id: `paid-${a.businessId}`,
    image: a.imageUrl,
    title: a.headline,
    subtitle: a.subline,
    href: a.hrefPath,
    badge: 'Sponsor',
  }));
}

/** İşletme reklamları önce; ardından platform slaytları (tekrar etmeden). */
export function mergeHeroSlides(platform: HeroSlide[], businessSlides: HeroSlide[]): HeroSlide[] {
  const seen = new Set<string>();
  const out: HeroSlide[] = [];
  for (const s of [...businessSlides, ...platform]) {
    if (seen.has(s.image)) continue;
    seen.add(s.image);
    out.push(s);
  }
  return out.length > 0 ? out : platform;
}

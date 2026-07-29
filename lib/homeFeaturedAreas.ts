/**
 * Ana sayfada gösterilen sınırlı “öne çıkan alanlar” — görseller + `/business?area=…` linkleri.
 * İsimler `BUSINESS_CATEGORY_GROUPS` ile birebir eşleşmeli.
 */
export type HomeFeaturedArea = {
  name: string;
  /** Kısa alt satır */
  tagline: string;
  image: string;
};

export const HOME_FEATURED_AREAS: HomeFeaturedArea[] = [
  {
    name: 'Sağlık',
    tagline: 'Klinik, diş, terapi',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Güzellik & Bakım',
    tagline: 'Kuaför, berber, SPA',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Spor & Wellness',
    tagline: 'Fitness, yoga, pilates',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Eğitim',
    tagline: 'Ders, dil, yazılım',
    image:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Otomotiv',
    tagline: 'Servis, yıkama, lastik',
    image:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Yeme & İçme',
    tagline: 'Restoran, cafe, catering',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  },
];

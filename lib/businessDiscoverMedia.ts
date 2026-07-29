/** İşletme keşfet — stok videolar (promoVideoUrl yoksa önizleme için) */

const VIDEOS = {
  salon: 'https://videos.pexels.com/video-files/3997988/3997988-hd_1080_1920_25fps.mp4',
  beauty: 'https://videos.pexels.com/video-files/5473962/5473962-hd_1080_1920_25fps.mp4',
  restaurant: 'https://videos.pexels.com/video-files/3209663/3209663-hd_1080_1920_25fps.mp4',
  medical: 'https://videos.pexels.com/video-files/8322525/8322525-hd_1080_1920_25fps.mp4',
  auto: 'https://videos.pexels.com/video-files/4484076/4484076-hd_1080_1920_25fps.mp4',
  default: 'https://videos.pexels.com/video-files/6774633/6774633-hd_1080_1920_25fps.mp4',
} as const;

const TYPE_TO_VIDEO: Record<string, keyof typeof VIDEOS> = {
  hair_salon: 'salon',
  barber: 'salon',
  nail_salon: 'salon',
  lash_brow: 'salon',
  beauty_center: 'beauty',
  aesthetic_clinic: 'beauty',
  skin_care: 'beauty',
  laser_epilation: 'beauty',
  spa_hamam: 'beauty',
  massage_salon: 'beauty',
  restaurant: 'restaurant',
  dental_clinic: 'medical',
  eye_doctor: 'medical',
  physiotherapist: 'medical',
  psychologist: 'medical',
  dietitian: 'medical',
  lab: 'medical',
  veterinarian: 'medical',
  auto_repair: 'auto',
  car_wash: 'auto',
  tire_shop: 'auto',
  ac_service: 'auto',
  body_paint: 'auto',
  auto_expert: 'auto',
};

export interface DiscoverBusiness {
  _id: string;
  name: string;
  businessType: string;
  description?: string;
  imageUrl?: string | null;
  address?: { city?: string; district?: string };
  averageRating?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  promoVideoUrl?: string | null;
  promoVideoCaption?: string | null;
  promoVideoViews?: number | null;
  updatedAt?: string;
}

export function hasPromoVideo(business: Pick<DiscoverBusiness, 'promoVideoUrl'>): boolean {
  return Boolean(business.promoVideoUrl?.trim());
}

export function getDiscoverVideoUrl(
  business: Pick<DiscoverBusiness, 'businessType' | 'promoVideoUrl'>
): string | null {
  if (business.promoVideoUrl?.trim()) return business.promoVideoUrl.trim();
  const key = TYPE_TO_VIDEO[business.businessType] ?? 'default';
  return VIDEOS[key];
}

/** Sadece işletmenin yüklediği videolar */
export function filterBusinessesWithPromoVideo<T extends DiscoverBusiness>(list: T[]): T[] {
  return list.filter(hasPromoVideo);
}

/** Keşfet akışı — karışık sıra (tam Keşfet sayfası) */
export function buildDiscoverFeed<T extends DiscoverBusiness>(list: T[], count = 20): T[] {
  const withVideo = filterBusinessesWithPromoVideo(list);
  const shuffled = [...withVideo].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Son eklenen videolar — updatedAt azalan (ana sayfa vb.) */
export function getLatestDiscoverVideos<T extends DiscoverBusiness & { updatedAt?: string }>(
  list: T[],
  count = 5
): T[] {
  return filterBusinessesWithPromoVideo(list)
    .sort((a, b) => {
      const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bt - at;
    })
    .slice(0, count);
}

/** İzlenme sayısı gösterimi — 1.2K, 3.4M */
export function formatViewCount(count: number): string {
  const n = Math.max(0, count);
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (n >= 10_000) {
    const v = n / 1_000;
    return `${Math.round(v)}K`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v.toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(n);
}

const VIEW_SESSION_PREFIX = 'discover-viewed-';

/** Oturumda bir kez izlenme kaydı */
export async function recordDiscoverVideoView(
  businessId: string
): Promise<number | null> {
  if (typeof window === 'undefined') return null;
  const key = `${VIEW_SESSION_PREFIX}${businessId}`;
  if (sessionStorage.getItem(key)) return null;

  const { api } = await import('@/lib/api');
  try {
    const { data } = await api.post<{ data: { views: number } }>(
      `/business/${businessId}/discover-view`
    );
    sessionStorage.setItem(key, '1');
    return data.data.views;
  } catch {
    return null;
  }
}

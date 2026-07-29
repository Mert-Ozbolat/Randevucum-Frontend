import {
  Car,
  Dumbbell,
  HeartPulse,
  PawPrint,
  Scissors,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from 'lucide-react';

export type HomePopularCategory = {
  id: string;
  name: string;
  hint: string;
  href: string;
  Icon: LucideIcon;
  /** Kart vurgu tonu */
  tone?: 'primary' | 'accent';
  businessTypes?: string[];
  areas?: string[];
};

/** Popüler kategori kartları — sayılar gerçek işletme verisinden hesaplanır */
export const HOME_POPULAR_CATEGORIES: HomePopularCategory[] = [
  {
    id: 'kuafor',
    name: 'Kuaför',
    hint: 'Saç & bakım',
    href: '/business?type=hair_salon',
    Icon: Scissors,
    tone: 'primary',
    businessTypes: ['hair_salon'],
  },
  {
    id: 'berber',
    name: 'Berber',
    hint: 'Erkek kuaför & sakal',
    href: '/business?type=barber',
    Icon: Scissors,
    tone: 'accent',
    businessTypes: ['barber'],
  },
  {
    id: 'guzellik',
    name: 'Güzellik',
    hint: 'Estetik & bakım',
    href: '/business?area=G%C3%BCzellik%20%26%20Bak%C4%B1m',
    Icon: Sparkles,
    tone: 'accent',
    areas: ['Güzellik & Bakım'],
  },
  {
    id: 'spa',
    name: 'Spa',
    hint: 'Masaj & wellness',
    href: '/business?type=spa_hamam',
    Icon: Waves,
    tone: 'primary',
    businessTypes: ['spa_hamam', 'massage_salon'],
  },
  {
    id: 'klinik',
    name: 'Klinik',
    hint: 'Sağlık hizmetleri',
    href: '/business?area=Sa%C4%9Fl%C4%B1k',
    Icon: HeartPulse,
    tone: 'primary',
    areas: ['Sağlık'],
  },
  {
    id: 'dis',
    name: 'Diş',
    hint: 'Diş klinikleri',
    href: '/business?type=dental_clinic',
    Icon: Stethoscope,
    tone: 'accent',
    businessTypes: ['dental_clinic'],
  },
  {
    id: 'veteriner',
    name: 'Veteriner',
    hint: 'Pet sağlığı',
    href: '/business?type=veterinarian',
    Icon: PawPrint,
    tone: 'primary',
    businessTypes: ['veterinarian', 'pet_groomer', 'pet_trainer', 'pet_hotel'],
  },
  {
    id: 'spor',
    name: 'Spor',
    hint: 'Fitness & pilates',
    href: '/business?area=Spor%20%26%20Wellness',
    Icon: Dumbbell,
    tone: 'accent',
    areas: ['Spor & Wellness'],
  },
  {
    id: 'oto',
    name: 'Oto Servis',
    hint: 'Tamir & bakım',
    href: '/business?area=Otomotiv',
    Icon: Car,
    tone: 'primary',
    areas: ['Otomotiv'],
  },
  {
    id: 'restoran',
    name: 'Restoran',
    hint: 'Yeme & içme',
    href: '/business?type=restaurant',
    Icon: UtensilsCrossed,
    tone: 'accent',
    businessTypes: ['restaurant'],
    areas: ['Yeme & İçme'],
  },
];

export type CategoryCountBusiness = {
  businessType?: string;
  area?: string;
  mainCategory?: string;
  profession?: string;
};

export function countBusinessesForCategory(
  category: HomePopularCategory,
  businesses: CategoryCountBusiness[]
): number {
  return businesses.filter((b) => {
    const typeOk =
      category.businessTypes?.length &&
      category.businessTypes.includes(String(b.businessType || ''));
    const areaName = b.area || b.mainCategory || '';
    const areaOk = category.areas?.length && category.areas.includes(areaName);
    return Boolean(typeOk || areaOk);
  }).length;
}

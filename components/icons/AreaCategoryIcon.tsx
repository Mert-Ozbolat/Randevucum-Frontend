'use client';

import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Car,
  Dumbbell,
  GraduationCap,
  LayoutGrid,
  PawPrint,
  Plane,
  Scale,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react';

const AREA_ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  Sağlık: Stethoscope,
  'Güzellik & Bakım': Sparkles,
  'Spor & Wellness': Dumbbell,
  Eğitim: GraduationCap,
  'Danışmanlık & Hukuk': Scale,
  Otomotiv: Car,
  'Ev & Teknik Hizmet': Wrench,
  'Hayvan Bakımı': PawPrint,
  'Yeme & İçme': UtensilsCrossed,
  'Turizm & Etkinlik': Plane,
  Diğer: LayoutGrid,
};

export function AreaCategoryIcon({
  name,
  className,
  ...props
}: { name: string; className?: string } & LucideProps) {
  const Cmp = AREA_ICON_MAP[name] || LayoutGrid;
  return <Cmp className={className} strokeWidth={1.75} aria-hidden {...props} />;
}

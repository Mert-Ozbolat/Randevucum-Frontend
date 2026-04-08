'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { BUSINESS_TYPES } from '@/lib/constants';
import { BUSINESS_TYPE_LABELS } from '@/lib/businessCategories';

const DEFAULT_IMAGES: Record<string, string> = {
  hair_salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
  dental_clinic: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200',
  beauty_center: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
  other: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
};

interface BusinessGalleryProps {
  businessName: string;
  businessType: string;
  imageUrl?: string | null;
  /** Hero overlay: konum metni (örn. şehir veya tam adres) */
  locationText?: string;
  /** Hero overlay göstermek için true */
  showHeroOverlay?: boolean;
}

export function BusinessGallery({
  businessName,
  businessType,
  imageUrl,
  locationText,
  showHeroOverlay = false,
}: BusinessGalleryProps) {
  const src =
    imageUrl || DEFAULT_IMAGES[businessType] || DEFAULT_IMAGES.other;
  const categoryLabel = BUSINESS_TYPE_LABELS[businessType] || BUSINESS_TYPES[businessType] || businessType;

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-neutral-200 shadow-soft sm:h-80 md:h-96">
      <Image
        src={src}
        alt={businessName}
        fill
        className="object-cover"
        priority
        sizes="100vw"
        unoptimized={src.startsWith('http')}
      />
      {/* Yarı saydam gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
        aria-hidden
      />
      {showHeroOverlay && (
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              {categoryLabel}
            </span>
            {locationText && (
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden /> {locationText}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight drop-shadow-sm sm:text-3xl md:text-4xl">
            {businessName}
          </h1>
        </div>
      )}
    </div>
  );
}

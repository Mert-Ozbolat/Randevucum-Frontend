'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { BUSINESS_TYPES } from '@/lib/constants';
import { BUSINESS_TYPE_LABELS } from '@/lib/businessCategories';

interface BusinessCardProps {
  _id: string;
  name: string;
  businessType: string;
  address?: { city?: string; district?: string };
  description?: string;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  isPopular?: boolean;
  isNew?: boolean;
  isAvailableToday?: boolean;
}

const PLACEHOLDER_IMAGES: Record<string, string> = {
  hair_salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
  dental_clinic: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
  beauty_center: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  other: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
};

export function BusinessCard({
  _id,
  name,
  businessType,
  address,
  description,
  imageUrl,
  rating,
  reviewCount,
  isPopular = false,
  isNew = false,
  isAvailableToday = false,
}: BusinessCardProps) {
  const cover =
    imageUrl || PLACEHOLDER_IMAGES[businessType] || PLACEHOLDER_IMAGES.other;
  const location = [address?.district, address?.city].filter(Boolean).join(', ');
  const displayRating = rating != null && rating > 0 ? rating : null;
  const reviewLabelCount =
    reviewCount != null && reviewCount > 0 ? reviewCount : 0;

  return (
    <Link href={`/business/${_id}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition-all duration-300 hover:scale-[1.02] hover:border-primary-200 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-primary-500">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          <Image
            src={cover}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={cover.startsWith('http')}
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-soft backdrop-blur">
              {BUSINESS_TYPE_LABELS[businessType] || BUSINESS_TYPES[businessType] || businessType}
            </span>
            {isPopular && (
              <span className="rounded-full bg-amber-400/95 px-2.5 py-1 text-xs font-medium text-amber-900 shadow-soft backdrop-blur">
                Popüler
              </span>
            )}
            {isNew && (
              <span className="rounded-full bg-primary-400/95 px-2.5 py-1 text-xs font-medium text-primary-900 shadow-soft backdrop-blur">
                Yeni
              </span>
            )}
          </div>
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
            {displayRating != null && (
              <div className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-soft backdrop-blur">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
                <span className="text-sm font-semibold text-neutral-800">{displayRating.toFixed(1)}</span>
                {reviewLabelCount > 0 && (
                  <span className="text-xs text-neutral-500">({reviewLabelCount} yorum)</span>
                )}
              </div>
            )}
            {isAvailableToday && (
              <span className="rounded-full bg-emerald-500/95 px-2.5 py-1 text-xs font-medium text-white shadow-soft backdrop-blur">
                Bugün müsait
              </span>
            )}
            {(!displayRating || displayRating === 0) && !isNew && (
              <div className="rounded-full bg-white/95 px-2 py-1 text-xs font-medium text-neutral-500 shadow-soft backdrop-blur">
                Yeni
              </div>
            )}
          </div>
        </div>
        <div className="p-5">
          <h2 className="font-bold text-neutral-900 transition group-hover:text-primary-600 dark:text-neutral-50 dark:group-hover:text-primary-400">
            {name}
          </h2>
          {location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
              {location}
            </p>
          )}
          {description && (
            <p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
          )}
          <span className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white shadow-soft transition group-hover:bg-primary-600 group-hover:shadow-[0_4px_14px_rgba(34,197,94,0.4)] group-active:scale-[0.98] dark:bg-primary-600 dark:group-hover:bg-primary-700">
            Rezervasyon Yap
          </span>
        </div>
      </article>
    </Link>
  );
}

'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';

type FavoriteButtonProps = {
  businessId: string;
  className?: string;
  size?: 'sm' | 'md';
  /** Kart üzerinde; tıklama linki tetiklemesin */
  stopPropagation?: boolean;
};

export function FavoriteButton({
  businessId,
  className = '',
  size = 'md',
  stopPropagation = true,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, loading } = useFavorites();
  const active = isFavorite(businessId);
  const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const btnClass =
    size === 'sm'
      ? 'h-9 w-9'
      : 'h-10 w-10';

  const handleClick = async (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    await toggleFavorite(businessId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={active ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      title={active ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      className={`inline-flex items-center justify-center rounded-full border shadow-soft backdrop-blur transition hover:scale-105 disabled:opacity-60 ${
        active
          ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/60 dark:hover:bg-red-950/80'
          : 'border-neutral-200/90 bg-white/95 text-neutral-500 hover:border-red-200 hover:bg-red-50/80 hover:text-red-500 dark:border-neutral-600 dark:bg-neutral-900/90 dark:hover:text-red-400'
      } ${btnClass} ${className}`}
    >
      <Heart
        className={`${iconClass} transition-colors ${
          active
            ? 'fill-red-500 text-red-500 stroke-red-500'
            : 'fill-transparent text-neutral-500 stroke-neutral-500'
        }`}
        strokeWidth={active ? 2.5 : 2}
        aria-hidden
      />
    </button>
  );
}

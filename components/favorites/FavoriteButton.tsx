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
      className={`inline-flex items-center justify-center rounded-full border bg-white/95 shadow-soft backdrop-blur transition hover:scale-105 disabled:opacity-60 dark:bg-neutral-900/90 ${
        active
          ? 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/40'
          : 'border-neutral-200/90 text-neutral-500 hover:border-primary-300 hover:text-red-500 dark:border-neutral-600 dark:hover:text-red-400'
      } ${btnClass} ${className}`}
    >
      <Heart
        className={`${iconClass} ${active ? 'fill-red-500 text-red-500' : ''}`}
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}

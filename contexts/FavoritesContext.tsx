'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getStoredToken } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

type FavoritesContextValue = {
  ids: Set<string>;
  loading: boolean;
  isFavorite: (businessId: string) => boolean;
  toggleFavorite: (businessId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const t = getStoredToken() || token;
    if (!t) {
      setIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<{ data: { businessIds: string[] } }>('/favorites/ids');
      const list = res.data.data?.businessIds || [];
      setIds(new Set(list.map(String)));
    } catch {
      setIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh, token]);

  const isFavorite = useCallback((businessId: string) => ids.has(String(businessId)), [ids]);

  const toggleFavorite = useCallback(
    async (businessId: string): Promise<boolean> => {
      const t = getStoredToken() || token;
      if (!t) {
        const from =
          typeof window !== 'undefined'
            ? window.location.pathname + window.location.search
            : '/';
        window.location.href = `/login?from=${encodeURIComponent(from)}`;
        return false;
      }
      try {
        const res = await api.post<{ data: { favorited: boolean } }>('/favorites/toggle', {
          businessId,
        });
        const favorited = Boolean(res.data.data?.favorited);
        setIds((prev) => {
          const next = new Set(prev);
          if (favorited) next.add(String(businessId));
          else next.delete(String(businessId));
          return next;
        });
        return favorited;
      } catch {
        return ids.has(String(businessId));
      }
    },
    [ids, token]
  );

  const value = useMemo(
    () => ({ ids, loading, isFavorite, toggleFavorite, refresh }),
    [ids, loading, isFavorite, toggleFavorite, refresh]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}

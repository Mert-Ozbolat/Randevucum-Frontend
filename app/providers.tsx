'use client';

import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore, hydrateAuthStore } from '@/store/authStore';
import { rehydrateThemeFromStorage } from '@/store/themeStore';
import { ToastProvider } from '@/components/ui/Toast';
import { FavoritesProvider } from '@/contexts/FavoritesContext';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void hydrateAuthStore();
    void rehydrateThemeFromStorage();
  }, []);

  const tree = (
    <ToastProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </ToastProvider>
  );

  if (!googleClientId) {
    return tree;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>;
}

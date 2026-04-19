'use client';

import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '@/store/authStore';
import { rehydrateThemeFromStorage } from '@/store/themeStore';
import { ToastProvider } from '@/components/ui/Toast';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    void rehydrateThemeFromStorage();
  }, []);

  const tree = <ToastProvider>{children}</ToastProvider>;

  if (!googleClientId) {
    return tree;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>;
}

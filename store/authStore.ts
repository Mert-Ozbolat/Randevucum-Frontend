import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/auth';
import { getStoredToken, getStoredUser } from '@/lib/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      hydrate: () => {},
    }),
    { name: 'auth-storage', skipHydration: true }
  )
);

let hydratePromise: Promise<void> | null = null;

/** Zustand persist + localStorage yedek anahtarlarından oturumu yükler */
export function hydrateAuthStore(): Promise<void> {
  if (hydratePromise) return hydratePromise;
  hydratePromise = Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
    const { token, user, setAuth } = useAuthStore.getState();
    if (!token || !user) {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();
      if (storedToken && storedUser) {
        setAuth(storedToken, storedUser);
      }
    }
  });
  return hydratePromise;
}

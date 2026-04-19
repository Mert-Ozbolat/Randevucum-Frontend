import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

/** `html` öğesine `dark` sınıfını uygular (persist / ilk yükleme sonrası). */
export function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useThemeStore = create<{ theme: Theme; setTheme: (t: Theme) => void }>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyThemeToDocument(theme);
        set({ theme });
      },
    }),
    {
      name: 'theme',
      partialize: (state) => ({ theme: state.theme }),
      skipHydration: true,
    }
  )
);

/** localStorage’daki kayıtlı temayı okuyup DOM’a uygular (sayfa yenilemede koyu mod kalıcı olsun). */
export function rehydrateThemeFromStorage(): Promise<void> {
  const r = useThemeStore.persist.rehydrate();
  return Promise.resolve(r).then(() => {
    applyThemeToDocument(useThemeStore.getState().theme);
  });
}

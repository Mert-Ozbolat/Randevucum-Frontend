import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useThemeStore = create<{ theme: Theme; setTheme: (t: Theme) => void }>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    { name: 'theme', skipHydration: true }
  )
);

export function initTheme() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') as Theme | null : null;
  const theme = stored === 'dark' || stored === 'light' ? stored : 'light';
  applyTheme(theme);
  useThemeStore.setState({ theme });
}

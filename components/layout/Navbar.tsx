'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { usePathname } from 'next/navigation';
import { clearAuth } from '@/lib/auth';

const navLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/business', label: 'İşletmeler' },
  { href: '/pricing', label: 'Fiyatlar' },
];

export function Navbar() {
  const { user, token, logout: storeLogout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const pathname = usePathname();

  const handleLogout = () => {
    clearAuth();
    storeLogout();
    window.location.href = '/';
  };

  const toggleDark = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur shadow-soft dark:border-neutral-700 dark:bg-neutral-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
          Web Rezervasyon
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition hover:text-primary-600 dark:hover:text-primary-400 ${
                pathname === href ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleDark}
            className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            title={theme === 'dark' ? 'Açık mod' : 'Koyu mod'}
            aria-label={theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            ) : (
              <Moon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            )}
          </button>
          {token && user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Panel
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
              >
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
              >
                Giriş
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

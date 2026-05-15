'use client';

import Link from 'next/link';
import { Calendar, Heart, Menu, Moon, Sun, User, Building2, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { usePathname } from 'next/navigation';
import { clearAuth, isBusinessOwner, isCustomer } from '@/lib/auth';
import { Logo } from '@/components/brand/Logo';

const publicLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/business', label: 'İşletmeler' },
  { href: '/pricing', label: 'Fiyatlar' },
] as const;

export function Navbar() {
  const { user, token, logout: storeLogout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    storeLogout();
    window.location.href = '/';
  };

  const toggleDark = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const customerQuick =
    token && user && isCustomer(user)
      ? ([
          { href: '/dashboard/customer/reservations', label: 'Randevularım', Icon: Calendar },
          { href: '/dashboard/customer/favorites', label: 'Favorilerim', Icon: Heart },
          { href: '/dashboard/customer/profile', label: 'Profil', Icon: User },
        ] as const)
      : null;

  const businessQuick =
    token && user && isBusinessOwner(user)
      ? ([
          { href: '/dashboard/business', label: 'İşletme paneli', Icon: Building2 },
          { href: '/dashboard/business/reservations', label: 'Randevular', Icon: Calendar },
        ] as const)
      : null;

  const linkActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/90 bg-white/90 shadow-soft backdrop-blur-md dark:border-neutral-700/90 dark:bg-neutral-900/90">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Logo className="min-w-0" />
        </div>

        {/* Masaüstü: genel menü */}
        <nav className="hidden items-center md:flex">
          <div className="flex items-center gap-1 rounded-full border border-neutral-200/80 bg-neutral-50/90 px-1.5 py-1 dark:border-neutral-700 dark:bg-neutral-800/80">
            {publicLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  linkActive(href)
                    ? 'bg-white text-primary-700 shadow-sm dark:bg-neutral-700 dark:text-primary-300'
                    : 'text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Giriş yapmış: hızlı erişim (masaüstü) */}
          {customerQuick && (
            <div className="hidden items-center gap-1 md:flex">
              {customerQuick.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
                    linkActive(href)
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-primary-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-primary-400'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                  {label}
                </Link>
              ))}
            </div>
          )}
          {businessQuick && (
            <div className="hidden items-center gap-1 md:flex">
              {businessQuick.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
                    linkActive(href)
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-primary-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-primary-400'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                  {label}
                </Link>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={toggleDark}
            className="rounded-full p-2.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/dashboard"
                className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Panel
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Giriş
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Kayıt Ol
              </Link>
            </div>
          )}

          {/* Mobil menü tetikleyici */}
          <button
            type="button"
            className="inline-flex rounded-full p-2.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
            <span className="sr-only">Menü</span>
          </button>
        </div>
      </div>

      {/* Mobil açılır menü */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-neutral-200 bg-white/98 px-4 py-4 dark:border-neutral-700 dark:bg-neutral-900/98 md:hidden"
        >
          <nav className="flex flex-col gap-1">
            {publicLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  linkActive(href)
                    ? 'bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                {label}
              </Link>
            ))}
            {customerQuick?.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-800 dark:text-neutral-200 dark:hover:bg-primary-900/30 dark:hover:text-primary-200"
              >
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                {label}
              </Link>
            ))}
            {businessQuick?.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-800 dark:text-neutral-200 dark:hover:bg-primary-900/30 dark:hover:text-primary-200"
              >
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700 sm:hidden">
            {token && user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-primary-500 py-3 text-center text-sm font-semibold text-white"
                >
                  Panel
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="rounded-xl py-3 text-sm font-medium text-neutral-600 dark:text-neutral-300"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl py-3 text-center text-sm font-medium text-neutral-700 dark:text-neutral-200"
                >
                  Giriş
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-primary-500 py-3 text-center text-sm font-semibold text-white"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

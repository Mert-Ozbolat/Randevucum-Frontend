"use client";

import Link from "next/link";
import {
  Calendar,
  Heart,
  Menu,
  Moon,
  Sun,
  User,
  Building2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { usePathname } from "next/navigation";
import { clearAuth, isBusinessOwner, isCustomer } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";

const publicLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/business", label: "İşletmeler" },
  { href: "/business/discover", label: "Keşfet" },
  { href: "/pricing", label: "Fiyatlar" },
] as const;

type QuickLink = {
  href: string;
  label: string;
  Icon: typeof Calendar;
};

export function Navbar() {
  const { user, token, logout: storeLogout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    clearAuth();
    storeLogout();
    window.location.href = "/";
  };

  const toggleDark = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const customerQuick: QuickLink[] | null =
    token && user && isCustomer(user)
      ? [
          {
            href: "/dashboard/customer/reservations",
            label: "Randevularım",
            Icon: Calendar,
          },
          {
            href: "/dashboard/customer/favorites",
            label: "Favorilerim",
            Icon: Heart,
          },
          { href: "/dashboard/profile", label: "Profil", Icon: User },
        ]
      : null;

  const businessQuick: QuickLink[] | null =
    token && user && isBusinessOwner(user)
      ? [
          {
            href: "/dashboard/business",
            label: "İşletme paneli",
            Icon: Building2,
          },
          {
            href: "/dashboard/business/reservations",
            label: "Randevular",
            Icon: Calendar,
          },
          {
            href: "/dashboard/customer/favorites",
            label: "Favorilerim",
            Icon: Heart,
          },
        ]
      : null;

  const roleQuick = customerQuick || businessQuick;

  const isHome = pathname === "/";

  const linkActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname?.startsWith(`${href}/`);

  const navLinkClass = (href: string, compact = false) =>
    `rounded-full font-medium transition ${
      compact
        ? "px-2.5 py-1.5 text-xs xl:px-3.5 xl:py-2 xl:text-sm"
        : "px-3.5 py-2 text-sm"
    } ${
      linkActive(href)
        ? "bg-white text-primary-700 shadow-sm dark:bg-neutral-700 dark:text-primary-300"
        : "text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
    }`;

  const roleLinkClass = (href: string, compact = false) =>
    `inline-flex items-center gap-1.5 rounded-full font-medium transition ${
      compact
        ? "px-2.5 py-1.5 text-xs xl:gap-1.5 xl:px-3 xl:py-2 xl:text-sm"
        : "px-3 py-2 text-sm"
    } ${
      linkActive(href)
        ? "bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200"
        : "text-neutral-600 hover:bg-neutral-100 hover:text-primary-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-primary-400"
    }`;

  const mobileNavLinkClass = (href: string) =>
    `rounded-xl px-4 py-3 text-sm font-medium ${
      linkActive(href)
        ? "bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/90 bg-white/90 shadow-soft backdrop-blur-md dark:border-neutral-700/90 dark:bg-neutral-900/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-[4.25rem] sm:gap-3 sm:px-6 lg:px-8">
        <div className="min-w-0 shrink">
          <Logo
            size="sm"
            className="sm:hidden"
            variant={isHome ? "wordmark" : "default"}
          />
          <Logo
            className="hidden sm:inline-flex"
            variant={isHome ? "wordmark" : "default"}
          />
        </div>

        {/* Masaüstü / geniş tablet — yatay menü (lg+) */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex max-w-full items-center gap-0.5 rounded-full border border-neutral-200/80 bg-neutral-50/90 px-1 py-1 dark:border-neutral-700 dark:bg-neutral-800/80 xl:gap-1 xl:px-1.5">
            {publicLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={navLinkClass(href, true)}>
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {roleQuick && (
            <div className="hidden min-w-0 items-center gap-0.5 lg:flex xl:gap-1">
              {roleQuick.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={roleLinkClass(href, true)}
                  title={label}
                >
                  <Icon
                    className="h-4 w-4 shrink-0 opacity-90"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="hidden xl:inline">{label}</span>
                </Link>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={toggleDark}
            className="rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 sm:p-2.5 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            title={theme === "dark" ? "Açık mod" : "Koyu mod"}
            aria-label={theme === "dark" ? "Açık moda geç" : "Koyu moda geç"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            ) : (
              <Moon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            )}
          </button>

          {token && user ? (
            <div className="hidden items-center gap-1 lg:flex xl:gap-2">
              <Link
                href="/dashboard"
                className="rounded-full bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 xl:px-4 xl:py-2 xl:text-sm"
              >
                Panel
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 xl:px-3 xl:py-2 xl:text-sm"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-1 lg:flex xl:gap-2">
              <Link
                href="/login"
                className="rounded-full px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 xl:px-3 xl:py-2 xl:text-sm"
              >
                Giriş
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 xl:px-4 xl:py-2 xl:text-sm"
              >
                Kayıt Ol
              </Link>
            </div>
          )}

          <button
            type="button"
            className="inline-flex rounded-full p-2 text-neutral-700 hover:bg-neutral-100 sm:p-2.5 lg:hidden dark:text-neutral-200 dark:hover:bg-neutral-800"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" aria-hidden />
            ) : (
              <Menu className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Mobil / tablet menü (lg altı) */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="fixed inset-0 z-40 animate-fade-in bg-neutral-900/50 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="mobile-nav"
            className="absolute left-0 right-0 top-full z-50 max-h-[calc(100dvh-3.5rem)] animate-slide-down overflow-y-auto border-t border-neutral-200 bg-white shadow-lg sm:max-h-[calc(100dvh-4.25rem)] dark:border-neutral-700 dark:bg-neutral-900 lg:hidden"
          >
            <nav className="mx-auto max-w-7xl px-3 py-3 sm:px-6">
              <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Menü
              </p>
              <div className="flex flex-col gap-0.5">
                {publicLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={mobileNavLinkClass(href)}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {roleQuick && roleQuick.length > 0 && (
                <>
                  <p className="mb-1 mt-4 px-4 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    Hesabım
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {roleQuick.map(({ href, label, Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 ${mobileNavLinkClass(href)}`}
                      >
                        <Icon
                          className="h-5 w-5 shrink-0 opacity-90"
                          strokeWidth={2}
                          aria-hidden
                        />
                        {label}
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                {token && user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl bg-primary-500 py-3 text-center text-sm font-semibold text-white shadow-soft"
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
                      className="rounded-xl border border-neutral-200 py-3 text-center text-sm font-medium text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                    >
                      Giriş
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl bg-primary-500 py-3 text-center text-sm font-semibold text-white shadow-soft"
                    >
                      Kayıt Ol
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

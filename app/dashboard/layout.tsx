'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BusinessSetupStatusBar } from '@/components/dashboard/BusinessSetupStatusBar';
import { Building2, Calendar, CalendarDays, Heart, Menu, User } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardBackButton } from '@/components/layout/DashboardBackButton';
import { StaffPanelProvider, useStaffPanel } from '@/contexts/StaffPanelContext';
import { DashboardShellProvider, useDashboardShell } from '@/contexts/DashboardShellContext';
import { useAuthStore } from '@/store/authStore';
import { clearAuth, isBusinessOwner } from '@/lib/auth';
import {
  businessOwnerLandingPath,
  fetchBusinessSetupStatus,
  shouldRedirectBusinessOwner,
} from '@/lib/businessOwnerRedirect';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffPanelProvider>
      <DashboardShellProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardShellProvider>
    </StaffPanelProvider>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuthStore();
  const { canViewStaffPanel } = useStaffPanel();
  const { openSidebar } = useDashboardShell();

  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = useAuthStore.getState().token;
    if (!t) router.replace('/login?from=/dashboard');
  }, [router]);

  useEffect(() => {
    if (!user) return;
    if (!isBusinessOwner(user) && pathname?.startsWith('/dashboard/business')) {
      router.replace('/dashboard/customer/reservations');
    }
    const ownerBlockedCustomer =
      pathname?.startsWith('/dashboard/customer/reservations') ||
      pathname?.startsWith('/dashboard/customer/favorites');
    if (isBusinessOwner(user) && ownerBlockedCustomer) {
      void fetchBusinessSetupStatus().then((status) => {
        router.replace(businessOwnerLandingPath(status));
      });
    }
  }, [user, pathname, router]);

  useEffect(() => {
    if (!user || !shouldRedirectBusinessOwner(user, pathname || '')) return;
    let cancelled = false;
    void fetchBusinessSetupStatus().then((status) => {
      if (cancelled) return;
      const target = businessOwnerLandingPath(status);
      if (target !== pathname) router.replace(target);
    });
    return () => {
      cancelled = true;
    };
  }, [user, pathname, router]);

  const handleLogout = () => {
    clearAuth();
    logout();
    router.push('/');
  };

  if (!token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const owner = isBusinessOwner(user);
  const showBusinessSetupBar = owner && Boolean(pathname?.startsWith('/dashboard'));
  const headerScopeTitle = pathname?.startsWith('/dashboard/staff')
    ? 'İş randevularım'
    : owner
      ? 'İşletme paneli'
      : 'Hesabım';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />
      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-white/95 px-3 py-2.5 backdrop-blur shadow-soft dark:border-neutral-700 dark:bg-neutral-900/95 sm:min-h-16 sm:gap-3 sm:px-4 sm:py-3 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openSidebar}
              className="inline-flex shrink-0 rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 lg:hidden"
              aria-label="Menüyü aç"
              aria-controls="dashboard-sidebar"
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <DashboardBackButton fallbackHref={owner ? '/dashboard/business' : '/'} />
                <h1 className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-50 sm:text-lg">
                  {headerScopeTitle}
                </h1>
              </div>
              {!owner && (
                <div className="hidden flex-wrap gap-2 md:flex">
                  <Link
                    href="/dashboard/customer/reservations"
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                      pathname?.startsWith('/dashboard/customer/reservations')
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/55 dark:text-primary-50'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-primary-50 hover:text-primary-800 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-primary-950/45 dark:hover:text-primary-50'
                    }`}
                  >
                    <Calendar className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    Randevularım
                  </Link>
                  {canViewStaffPanel && (
                    <Link
                      href="/dashboard/staff/reservations"
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                        pathname?.startsWith('/dashboard/staff')
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/55 dark:text-primary-50'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-primary-50 hover:text-primary-800 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-primary-950/45 dark:hover:text-primary-50'
                      }`}
                    >
                      <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                      İş randevularım
                    </Link>
                  )}
                  <Link
                    href="/dashboard/customer/favorites"
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                      pathname?.startsWith('/dashboard/customer/favorites')
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/55 dark:text-primary-50'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-primary-50 hover:text-primary-800 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-primary-950/45 dark:hover:text-primary-50'
                    }`}
                  >
                    <Heart className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    Favorilerim
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                      pathname?.startsWith('/dashboard/profile')
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/55 dark:text-primary-50'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-primary-50 hover:text-primary-800 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-primary-950/45 dark:hover:text-primary-50'
                    }`}
                  >
                    <User className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    Profil
                  </Link>
                </div>
              )}
              {owner && (
                <div className="hidden flex-wrap gap-2 md:flex">
                  <Link
                    href="/dashboard/business"
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                      pathname === '/dashboard/business'
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/55 dark:text-primary-50'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-primary-50 hover:text-primary-800 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-primary-950/45 dark:hover:text-primary-50'
                    }`}
                  >
                    <Building2 className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    Özet
                  </Link>
                  <Link
                    href="/dashboard/business/reservations"
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                      pathname?.startsWith('/dashboard/business/reservations')
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/55 dark:text-primary-50'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-primary-50 hover:text-primary-800 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-primary-950/45 dark:hover:text-primary-50'
                    }`}
                  >
                    <Calendar className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    Randevular
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[10rem] truncate text-sm text-neutral-600 dark:text-neutral-400 md:inline lg:max-w-[12rem]">
              {user.firstName} {user.lastName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full px-2.5 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 sm:px-3"
            >
              Çıkış
            </button>
          </div>
        </header>
        {showBusinessSetupBar && <BusinessSetupStatusBar />}
        <main className="min-w-0 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

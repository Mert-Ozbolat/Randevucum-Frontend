'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BusinessSetupStatusBar } from '@/components/dashboard/BusinessSetupStatusBar';
import { Building2, Calendar, CalendarDays, User } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardBackButton } from '@/components/layout/DashboardBackButton';
import { StaffPanelProvider, useStaffPanel } from '@/contexts/StaffPanelContext';
import { useAuthStore } from '@/store/authStore';
import { clearAuth, isBusinessOwner } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffPanelProvider>
      <DashboardShell>{children}</DashboardShell>
    </StaffPanelProvider>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuthStore();
  const { canViewStaffPanel } = useStaffPanel();

  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = useAuthStore.getState().token;
    if (!t) router.replace('/login?from=/dashboard');
  }, [router]);

  // Role-based routing: customer → only customer pages; business owner → only business admin
  useEffect(() => {
    if (!user) return;
    if (!isBusinessOwner(user) && pathname?.startsWith('/dashboard/business')) {
      router.replace('/dashboard/customer/reservations');
    }
    if (isBusinessOwner(user) && pathname?.startsWith('/dashboard/customer')) {
      router.replace('/dashboard/business');
    }
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
  const showBusinessSetupBar = owner && pathname?.startsWith('/dashboard/business');
  const headerScopeTitle = pathname?.startsWith('/dashboard/staff')
    ? 'İş randevularım'
    : owner
      ? 'İşletme paneli'
      : 'Hesabım';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />
      <div className="pl-64">
        <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur shadow-soft dark:border-neutral-700 dark:bg-neutral-900/95 sm:px-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
              <DashboardBackButton fallbackHref={owner ? '/dashboard/business' : '/'} />
              <h1 className="truncate text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                {headerScopeTitle}
              </h1>
            </div>
            {!owner && (
              <div className="flex flex-wrap gap-2">
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
                  href="/dashboard/customer/profile"
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                    pathname?.startsWith('/dashboard/customer/profile')
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
              <div className="flex flex-wrap gap-2">
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
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[12rem] truncate text-sm text-neutral-600 dark:text-neutral-400 sm:inline">
              {user.firstName} {user.lastName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              Çıkış
            </button>
          </div>
        </header>
        {showBusinessSetupBar && <BusinessSetupStatusBar />}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

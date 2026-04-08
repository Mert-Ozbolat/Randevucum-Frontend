'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { clearAuth, isBusinessOwner } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuthStore();

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

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <div className="pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-6 backdrop-blur shadow-soft">
          <h1 className="text-lg font-semibold text-neutral-900">Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">
              {user.firstName} {user.lastName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              Çıkış
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

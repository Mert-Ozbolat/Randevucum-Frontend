'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Calendar,
  CalendarDays,
  Clock,
  CreditCard,
  Heart,
  Home,
  LayoutDashboard,
  Megaphone,
  Scissors,
  User,
  Users,
  X,
} from 'lucide-react';
import { isBusinessOwner } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useStaffPanel } from '@/contexts/StaffPanelContext';
import { useDashboardShell } from '@/contexts/DashboardShellContext';
import { Logo } from '@/components/brand/Logo';

type SidebarLink = {
  href: string;
  label: string;
  Icon: LucideIcon;
  emphasize?: boolean;
  isActive?: (pathname: string | null) => boolean;
};

const businessLinks: SidebarLink[] = [
  { href: '/dashboard/business', label: 'Özet', Icon: LayoutDashboard },
  { href: '/dashboard/business/info', label: 'İşletme Bilgisi', Icon: Building2 },
  { href: '/dashboard/business/services', label: 'Hizmetler', Icon: Scissors },
  { href: '/dashboard/business/staff', label: 'Personel', Icon: Users },
  { href: '/dashboard/business/working-hours', label: 'Çalışma Saatleri', Icon: Clock },
  { href: '/dashboard/business/reservations', label: 'Randevular', Icon: Calendar },
  { href: '/dashboard/business/slider-ad', label: 'Ana sayfa reklamı', Icon: Megaphone },
  { href: '/dashboard/business/subscription', label: 'Abonelik', Icon: CreditCard },
  { href: '/dashboard/customer/favorites', label: 'Favorilerim', Icon: Heart },
  { href: '/dashboard/profile', label: 'Profil', Icon: User },
];

const customerLinks: SidebarLink[] = [
  { href: '/dashboard/customer/reservations', label: 'Randevularım', Icon: Calendar, emphasize: true },
  { href: '/dashboard/customer/favorites', label: 'Favorilerim', Icon: Heart, emphasize: true },
  { href: '/dashboard/profile', label: 'Profil', Icon: User, emphasize: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isOwner = isBusinessOwner(user);
  const { canViewStaffPanel } = useStaffPanel();
  const { sidebarOpen, closeSidebar } = useDashboardShell();

  const links: SidebarLink[] = (() => {
    if (isOwner) return businessLinks;
    const base = [...customerLinks];
    if (canViewStaffPanel) {
      base.splice(1, 0, {
        href: '/dashboard/staff/reservations',
        label: 'İş randevularım',
        Icon: CalendarDays,
        emphasize: true,
        isActive: (p) => Boolean(p?.startsWith('/dashboard/staff')),
      });
    }
    return base;
  })();

  return (
    <>
      <button
        type="button"
        aria-label="Menüyü kapat"
        className={`fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeSidebar}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <aside
        id="dashboard-sidebar"
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-[min(100vw-3rem,17rem)] max-w-[85vw] flex-col border-r border-neutral-200 bg-gradient-to-b from-white to-neutral-50/80 shadow-soft transition-transform duration-300 ease-out dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-900/95 lg:z-40 lg:w-64 lg:max-w-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        aria-label="Panel menüsü"
      >
        <SidebarHeader>
          <Logo size="sm" href="/" />
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 lg:hidden"
            aria-label="Menüyü kapat"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </SidebarHeader>

        {!isOwner && (
          <p className="border-b border-neutral-100 px-5 pb-3 pt-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            Hızlı erişim
          </p>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
          {links.map(({ href, label, Icon, emphasize, isActive }) => {
            const active = isActive ? isActive(pathname) : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  emphasize && !isOwner
                    ? active
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 dark:bg-primary-600 dark:text-white'
                      : 'bg-primary-50/90 text-primary-900 hover:bg-primary-100 dark:bg-primary-950/60 dark:text-primary-50 dark:hover:bg-primary-900/55 dark:hover:text-white'
                    : active
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-50'
                      : 'text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <SidebarFooter>
          <Link
            href="/"
            onClick={closeSidebar}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <Home className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Ana sayfaya dön
          </Link>
        </SidebarFooter>
      </aside>
    </>
  );
}

function SidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[4.25rem] shrink-0 items-center justify-between border-b border-neutral-200/90 px-4 dark:border-neutral-700">
      {children}
    </div>
  );
}

function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div className="shrink-0 border-t border-neutral-200 p-3 dark:border-neutral-700">{children}</div>;
}

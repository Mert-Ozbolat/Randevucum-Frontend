'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Calendar, CalendarDays, Heart, LayoutDashboard, Menu } from 'lucide-react';
import { isBusinessOwner } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useStaffPanel } from '@/contexts/StaffPanelContext';
import { useDashboardShell } from '@/contexts/DashboardShellContext';

type NavItem =
  | {
      type: 'link';
      href: string;
      label: string;
      Icon: LucideIcon;
      primary?: boolean;
      isActive?: (pathname: string | null) => boolean;
    }
  | {
      type: 'action';
      label: string;
      Icon: LucideIcon;
      onClick: () => void;
    };

function buildNavItems(
  isOwner: boolean,
  canViewStaffPanel: boolean,
  openSidebar: () => void
): NavItem[] {
  if (isOwner) {
    return [
      {
        type: 'link',
        href: '/dashboard/business',
        label: 'Özet',
        Icon: LayoutDashboard,
        isActive: (p) => p === '/dashboard/business',
      },
      {
        type: 'link',
        href: '/dashboard/business/reservations',
        label: 'Randevular',
        Icon: Calendar,
        primary: true,
        isActive: (p) => Boolean(p?.startsWith('/dashboard/business/reservations')),
      },
      {
        type: 'action',
        label: 'Menü',
        Icon: Menu,
        onClick: openSidebar,
      },
    ];
  }

  if (canViewStaffPanel) {
    return [
      {
        type: 'link',
        href: '/dashboard/staff/reservations',
        label: 'İş randevuları',
        Icon: CalendarDays,
        primary: true,
        isActive: (p) => Boolean(p?.startsWith('/dashboard/staff')),
      },
      {
        type: 'link',
        href: '/dashboard/customer/reservations',
        label: 'Randevularım',
        Icon: Calendar,
        isActive: (p) => Boolean(p?.startsWith('/dashboard/customer/reservations')),
      },
      {
        type: 'action',
        label: 'Menü',
        Icon: Menu,
        onClick: openSidebar,
      },
    ];
  }

  return [
    {
      type: 'link',
      href: '/dashboard/customer/reservations',
      label: 'Randevularım',
      Icon: Calendar,
      primary: true,
      isActive: (p) => Boolean(p?.startsWith('/dashboard/customer/reservations')),
    },
    {
      type: 'link',
      href: '/dashboard/customer/favorites',
      label: 'Favoriler',
      Icon: Heart,
      isActive: (p) => Boolean(p?.startsWith('/dashboard/customer/favorites')),
    },
    {
      type: 'action',
      label: 'Menü',
      Icon: Menu,
      onClick: openSidebar,
    },
  ];
}

export function DashboardMobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isOwner = isBusinessOwner(user);
  const { canViewStaffPanel } = useStaffPanel();
  const { openSidebar } = useDashboardShell();

  const items = buildNavItems(isOwner, canViewStaffPanel, openSidebar);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/90 bg-white/95 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md dark:border-neutral-700/90 dark:bg-neutral-900/95 lg:hidden"
      aria-label="Mobil panel navigasyonu"
    >
      <div
        className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5 px-1 pt-1.5"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {items.map((item) => {
          if (item.type === 'action') {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold text-neutral-600 transition active:scale-[0.97] dark:text-neutral-400"
              >
                <item.Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                <span className="truncate">{item.label}</span>
              </button>
            );
          }

          const active = item.isActive ? item.isActive(pathname) : pathname === item.href;

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-bold transition active:scale-[0.97] ${
                  active
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 dark:bg-primary-500'
                    : 'bg-primary-50 text-primary-800 dark:bg-primary-950/60 dark:text-primary-100'
                }`}
              >
                <item.Icon className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition active:scale-[0.97] ${
                active
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <item.Icon
                className={`h-5 w-5 shrink-0 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`}
                strokeWidth={active ? 2.25 : 2}
                aria-hidden
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

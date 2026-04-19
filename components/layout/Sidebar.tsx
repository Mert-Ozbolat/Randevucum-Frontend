'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Home,
  LayoutDashboard,
  Megaphone,
  Scissors,
  User,
  Users,
} from 'lucide-react';
import { isBusinessOwner } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { Logo } from '@/components/brand/Logo';

type SidebarLink = { href: string; label: string; Icon: LucideIcon; emphasize?: boolean };

const businessLinks: SidebarLink[] = [
  { href: '/dashboard/business', label: 'Özet', Icon: LayoutDashboard },
  { href: '/dashboard/business/info', label: 'İşletme Bilgisi', Icon: Building2 },
  { href: '/dashboard/business/services', label: 'Hizmetler', Icon: Scissors },
  { href: '/dashboard/business/staff', label: 'Personel', Icon: Users },
  { href: '/dashboard/business/working-hours', label: 'Çalışma Saatleri', Icon: Clock },
  { href: '/dashboard/business/reservations', label: 'Randevular', Icon: Calendar },
  { href: '/dashboard/business/slider-ad', label: 'Ana sayfa reklamı', Icon: Megaphone },
  { href: '/dashboard/business/subscription', label: 'Abonelik', Icon: CreditCard },
];

const customerLinks: SidebarLink[] = [
  { href: '/dashboard/customer/reservations', label: 'Randevularım', Icon: Calendar, emphasize: true },
  { href: '/dashboard/customer/profile', label: 'Profil', Icon: User, emphasize: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isOwner = isBusinessOwner(user);
  const links = isOwner ? businessLinks : customerLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-neutral-200 bg-gradient-to-b from-white to-neutral-50/80 shadow-soft dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-900/95">
      <div className="flex h-[4.25rem] items-center border-b border-neutral-200/90 px-4 dark:border-neutral-700">
        <Logo size="sm" href="/" />
      </div>

      {!isOwner && (
        <p className="border-b border-neutral-100 px-5 pb-3 pt-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          Hızlı erişim
        </p>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ href, label, Icon, emphasize }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                emphasize && !isOwner
                  ? active
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 dark:bg-primary-600'
                    : 'bg-primary-50/90 text-primary-900 hover:bg-primary-100 dark:bg-primary-950/50 dark:text-primary-100 dark:hover:bg-primary-900/40'
                  : active
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200'
                    : 'text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 p-3 dark:border-neutral-700">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <Home className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Ana sayfaya dön
        </Link>
      </div>
    </aside>
  );
}

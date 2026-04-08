'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Calendar,
  Clock,
  CreditCard,
  LayoutDashboard,
  Scissors,
  User,
  Users,
} from 'lucide-react';
import { isBusinessOwner } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

const businessLinks: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/dashboard/business', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/dashboard/business/info', label: 'İşletme Bilgisi', Icon: Building2 },
  { href: '/dashboard/business/services', label: 'Hizmetler', Icon: Scissors },
  { href: '/dashboard/business/staff', label: 'Personel', Icon: Users },
  { href: '/dashboard/business/working-hours', label: 'Çalışma Saatleri', Icon: Clock },
  { href: '/dashboard/business/reservations', label: 'Randevular', Icon: Calendar },
  { href: '/dashboard/business/subscription', label: 'Abonelik', Icon: CreditCard },
];

const customerLinks: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/dashboard/customer/reservations', label: 'Randevularım', Icon: Calendar },
  { href: '/dashboard/customer/profile', label: 'Profil', Icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isOwner = isBusinessOwner(user);
  const links = isOwner ? businessLinks : customerLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-200 bg-white shadow-soft dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex h-16 items-center border-b border-neutral-200 px-6 dark:border-neutral-700">
        <Link href="/dashboard" className="text-lg font-bold text-primary-600 dark:text-primary-400">
          Web Rezervasyon
        </Link>
      </div>
      <nav className="space-y-0.5 p-4">
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              pathname === href
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

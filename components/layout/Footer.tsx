'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Heart, Shield, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

const EXPLORE_LINKS = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/business', label: 'İşletmeler' },
  { href: '/pricing', label: 'Fiyatlar' },
] as const;

const CUSTOMER_LINKS = [
  { href: '/login', label: 'Giriş yap' },
  { href: '/register', label: 'Kayıt ol' },
  { href: '/dashboard/customer/reservations', label: 'Randevularım' },
  { href: '/dashboard/customer/favorites', label: 'Favorilerim' },
] as const;

const BUSINESS_LINKS = [
  { href: '/register', label: 'İşletme kaydı' },
  { href: '/pricing', label: 'Paketler' },
  { href: '/dashboard/business', label: 'İşletme paneli' },
] as const;

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map(({ href, label }) => (
          <li key={`${title}-${href}`}>
            <Link
              href={href}
              className="text-sm text-neutral-600 transition hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-neutral-200/80 bg-gradient-to-b from-neutral-50 to-white dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/40 to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-12">
          {/* Marka */}
          <div className="max-w-sm">
            <Logo size="sm" href="/" />
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Kuaförden kliniğe — müsait saatleri görün, dakikalar içinde randevunuzu oluşturun.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { Icon: Calendar, label: 'Hızlı randevu' },
                { Icon: Heart, label: 'Favoriler' },
                { Icon: Shield, label: 'Güvenli' },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300"
                >
                  <Icon className="h-3.5 w-3.5 text-primary-500" strokeWidth={2} aria-hidden />
                  {label}
                </span>
              ))}
            </div>
            <Link
              href="/business"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              İşletmeleri keşfet
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>

          <FooterLinkGroup title="Keşfet" links={EXPLORE_LINKS} />
          <FooterLinkGroup title="Müşteriler" links={CUSTOMER_LINKS} />
          <FooterLinkGroup title="İşletmeler" links={BUSINESS_LINKS} />
        </div>

        {/* Alt çubuk */}
        <div className="mt-12 flex flex-col gap-4 border-t border-neutral-200/80 pt-8 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            © {year} Randevucum. Tüm hakları saklıdır.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/privacy"
              className="text-xs font-medium text-neutral-500 transition hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
            >
              Gizlilik Politikası
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
              <Sparkles className="h-3.5 w-3.5 text-primary-500" aria-hidden />
              Online randevu platformu
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

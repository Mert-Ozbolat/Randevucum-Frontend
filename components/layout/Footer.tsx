"use client";

import { ArrowRight, Calendar, Heart, Shield, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Logo } from "@/components/brand/Logo";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { LEGAL_LINKS } from "@/lib/legal/constants";
import { Link } from '@/i18n/navigation';

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map(({ href, label }) => (
          <li key={`${title}-${href}`}>
            <Link
              href={href}
              className="text-sm text-neutral-300 transition hover:text-primary-400"
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
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const year = new Date().getFullYear();

  const EXPLORE_LINKS = [
    { href: "/", label: tn("home") },
    { href: "/business", label: tn("businesses") },
    { href: "/pricing", label: tn("pricing") },
  ] as const;

  const CUSTOMER_LINKS = [
    { href: "/login", label: t("login") },
    { href: "/register", label: t("register") },
    { href: "/dashboard/customer/reservations", label: t("myReservations") },
    { href: "/dashboard/customer/favorites", label: tn("favorites") },
  ] as const;

  const BUSINESS_LINKS = [
    { href: "/register", label: t("businessRegister") },
    { href: "/pricing", label: t("packages") },
    { href: "/dashboard/business", label: t("businessPanel") },
  ] as const;

  return (
    <footer className="relative border-t border-neutral-800 bg-neutral-900">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/40 to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <AnimateIn animation="slide-up">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-12">
            <div className="max-w-sm">
              <Logo size="sm" href="/" />
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                {t("tagline")}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { Icon: Calendar, label: t("quickBooking") },
                  { Icon: Heart, label: t("favorites") },
                  { Icon: Shield, label: t("secure") },
                ].map(({ Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800/80 px-3 py-1 text-xs font-medium text-neutral-300"
                  >
                    <Icon
                      className="h-3.5 w-3.5 text-primary-400"
                      strokeWidth={2}
                      aria-hidden
                    />
                    {label}
                  </span>
                ))}
              </div>
              <Link
                href="/business"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-400 transition hover:text-primary-300"
              >
                {t("exploreBusinesses")}
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </Link>
            </div>

            <FooterLinkGroup title={t("explore")} links={EXPLORE_LINKS} />
            <FooterLinkGroup title={t("customers")} links={CUSTOMER_LINKS} />
            <FooterLinkGroup title={t("businesses")} links={BUSINESS_LINKS} />
            <FooterLinkGroup title={t("legal")} links={LEGAL_LINKS} />
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-neutral-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-500">
              © {year} Randevucum. {t("rights")}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {LEGAL_LINKS.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium text-neutral-500 transition hover:text-primary-400"
                >
                  {link.label}
                </Link>
              ))}
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <Sparkles
                  className="h-3.5 w-3.5 text-primary-400"
                  aria-hidden
                />
                {t("onlinePlatform")}
              </span>
            </div>
          </div>
        </AnimateIn>
      </div>
    </footer>
  );
}

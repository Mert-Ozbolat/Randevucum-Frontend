'use client';

import {
  Bell,
  CalendarCheck,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Search,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';

const OFFER_KEYS = ['access', 'calendar', 'whatsapp', 'staff', 'search', 'nearby', 'reminders'] as const;

const OFFER_ICONS: Record<(typeof OFFER_KEYS)[number], LucideIcon> = {
  access: Zap,
  calendar: LayoutDashboard,
  whatsapp: MessageCircle,
  staff: Users,
  search: Search,
  nearby: MapPin,
  reminders: Bell,
};

function BookingMock() {
  const t = useTranslations('home.whatWeOffer');
  const slots = [
    { t: '09:00', on: false },
    { t: '09:30', on: true },
    { t: '10:00', on: false },
    { t: '11:00', on: false },
  ];
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-primary-100 bg-white p-4 text-left shadow-sm dark:border-primary-900/50 dark:bg-neutral-900 sm:mt-8 sm:p-5">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary-300/30 blur-3xl dark:bg-primary-500/25"
        aria-hidden
      />
      <p className="relative text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">
        {t('previewLabel')}
      </p>
      <p className="relative mt-2 text-sm font-semibold text-neutral-900 dark:text-white">
        {t('previewBusiness')}
      </p>
      <div className="relative mt-4 grid grid-cols-4 gap-2">
        {slots.map((s) => (
          <span
            key={s.t}
            className={`rounded-xl px-2 py-2.5 text-center text-xs font-semibold ${
              s.on
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-neutral-50 text-neutral-500 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700'
            }`}
          >
            {s.t}
          </span>
        ))}
      </div>
      <div className="relative mt-4 flex items-center justify-between rounded-xl bg-primary-50 px-3 py-2.5 ring-1 ring-primary-100 dark:bg-primary-950/50 dark:ring-primary-800">
        <span className="text-xs font-medium text-primary-700 dark:text-primary-200">
          {t('slotSelected')}
        </span>
        <span className="rounded-lg bg-primary-500 px-2.5 py-1 text-[11px] font-semibold text-white">
          {t('bookNow')}
        </span>
      </div>
    </div>
  );
}

export function HomeWhatWeOffer() {
  const t = useTranslations('home.whatWeOffer');

  return (
    <AnimateIn as="section" animation="slide-up" aria-labelledby="home-offer-title">
      <HomeSectionHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        align="center"
        titleSize="large"
        titleId="home-offer-title"
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3">
        <AnimateIn animation="scale-in" className="min-w-0 sm:col-span-2 lg:col-span-2 lg:row-span-2">
          <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-primary-200/80 bg-gradient-to-br from-primary-50 via-white to-accent-50 p-5 shadow-soft dark:border-primary-800/60 dark:from-primary-950/50 dark:via-neutral-900 dark:to-accent-950/30 sm:min-h-[320px] sm:p-6 lg:min-h-full lg:p-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-300/30 blur-3xl dark:bg-primary-500/20"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-accent-300/25 blur-3xl dark:bg-accent-500/15"
              aria-hidden
            />

            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-soft sm:h-14 sm:w-14">
              <CalendarCheck className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="relative mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400 sm:mt-5">
              {t('featuredBadge')}
            </p>
            <h3 className="relative mt-2 text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl lg:text-3xl">
              {t('featuredTitle')}
            </h3>
            <p className="relative mt-3 max-w-md text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
              {t('featuredText')}
            </p>
            <BookingMock />
          </div>
        </AnimateIn>

        {OFFER_KEYS.map((key, i) => {
          const Icon = OFFER_ICONS[key];
          const isLast = i === OFFER_KEYS.length - 1;
          return (
            <AnimateIn
              key={key}
              animation="slide-up"
              delay={60 + i * 40}
              className={`min-w-0 ${isLast ? 'sm:col-span-2 lg:col-span-2' : ''}`}
            >
              <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-primary-700">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-300">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-3 text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
                  {t(`offers.${key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {t(`offers.${key}.text`)}
                </p>
              </div>
            </AnimateIn>
          );
        })}
      </div>
    </AnimateIn>
  );
}

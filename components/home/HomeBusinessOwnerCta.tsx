'use client';

import { ArrowRight } from 'lucide-react';
import { Outfit } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { Link } from '@/i18n/navigation';

const display = Outfit({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

export function HomeBusinessOwnerCta() {
  const t = useTranslations('home.ownerCta');

  return (
    <AnimateIn as="section" animation="scale-in" aria-labelledby="home-owner-cta-title">
      <div
        className={`${display.className} relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-neutral-900 px-4 py-16 text-center sm:px-6 lg:px-8`}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,28rem)] w-[min(70vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/40 blur-3xl sm:h-[32rem] sm:w-[32rem]"
          aria-hidden
        />

        <div className="relative z-[1] mx-auto flex w-full max-w-5xl flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-400">
            {t('eyebrow')}
          </p>

          <h2
            id="home-owner-cta-title"
            className="mt-4 font-extrabold leading-[0.95] tracking-tight sm:mt-5"
          >
            <span className="block text-[clamp(2.75rem,12vw,7.5rem)] text-white">
              {t('titleToday')}
            </span>
            <span className="mt-1 block text-[clamp(2.75rem,12vw,7.5rem)] text-primary-400 sm:mt-2">
              {t('titleStart')}
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-neutral-300 sm:mt-8 sm:text-lg md:text-xl">
            {t('description')}
          </p>

          <div className="mt-8 sm:mt-10">
            <Link
              href="/register"
              className="group inline-flex items-center rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-400 sm:px-8 sm:py-3.5 sm:text-base md:px-10 md:py-4 md:text-lg"
            >
              {t('button')}
              <ArrowRight
                className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5 sm:h-5 sm:w-5"
                strokeWidth={2.25}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}

'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';

export function HomeHero() {
  return (
    <header className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-neutral-900">
      {/* Soft green + purple blur atmosphere */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-primary-500/30 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-[32rem] w-[32rem] rounded-full bg-accent-500/25 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <AnimateIn immediate animation="fade-in">
          <p className="inline-flex rounded-full bg-primary-500/20 px-4 py-2 text-sm font-semibold tracking-wide text-primary-300 ring-1 ring-primary-400/30 backdrop-blur-sm sm:px-5 sm:py-2.5 sm:text-base">
            KKTC&apos;nin Online Randevu Platformu
          </p>
        </AnimateIn>

        <AnimateIn immediate animation="slide-up" delay={70}>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-white sm:mt-7 sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.1]">
            Zamanını boşa harcama,{' '}
            <span className="text-primary-400">doğru saatte</span> randevunu{' '}
            <span className="text-primary-400">anında</span> al
          </h1>
        </AnimateIn>

        <AnimateIn immediate animation="slide-up" delay={140}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300 sm:text-xl">
            Binlerce işletme arasından dilediğini seç, uygun saatleri görüntüle ve saniyeler içinde
            randevunu oluştur.
          </p>
        </AnimateIn>

        <AnimateIn immediate animation="slide-up" delay={210}>
          <div className="mt-9 flex flex-row flex-wrap items-center justify-center gap-3 sm:mt-11 sm:gap-3.5">
            <Link
              href="#home-search"
              className="group inline-flex items-center rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-400 sm:px-6 sm:py-3 sm:text-base"
            >
              Randevu Al
              <ArrowRight
                className="ml-2 h-4 w-4 transition duration-300 group-hover:translate-x-0.5 sm:h-5 sm:w-5"
                strokeWidth={2.25}
                aria-hidden
              />
            </Link>
            <Link
              href="/business"
              className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/15 sm:px-6 sm:py-3 sm:text-base"
            >
              İşletmeleri Keşfet
            </Link>
          </div>
        </AnimateIn>
      </div>
    </header>
  );
}

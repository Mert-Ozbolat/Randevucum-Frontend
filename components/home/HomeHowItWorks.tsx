'use client';

import { Calendar, Check, Search } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';

const STEPS = [
  {
    step: '01',
    title: 'İşletme seçin',
    text: 'Kategori, konum veya puana göre arayın; profili ve hizmetleri inceleyin.',
    Icon: Search,
  },
  {
    step: '02',
    title: 'Saat seçin',
    text: 'Müsait slotları görün, hizmeti ve isteğe bağlı personeli seçin.',
    Icon: Calendar,
  },
  {
    step: '03',
    title: 'Randevunuz hazır',
    text: 'Randevunuz anında onaylanır. Başlangıç saatinden en geç 12 saat öncesine kadar iptal edebilirsiniz.',
    Icon: Check,
  },
] as const;

export function HomeHowItWorks() {
  return (
    <AnimateIn
      as="section"
      animation="scale-in"
      className="relative overflow-hidden rounded-3xl border border-primary-200/50 bg-gradient-to-br from-primary-50/90 via-white to-emerald-50/50 px-6 py-10 dark:border-primary-900/40 dark:from-primary-950/30 dark:via-neutral-900 dark:to-emerald-950/20 sm:px-10 sm:py-12"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-300/20 blur-3xl dark:bg-primary-700/10"
        aria-hidden
      />

      <HomeSectionHeader
        eyebrow="Süreç"
        title="Nasıl çalışır?"
        description="Üç adımda randevunuz hazır — kayıt ücretsiz, kullanım kolay."
        align="center"
      />

      <div className="relative mt-10 grid gap-6 sm:grid-cols-3 sm:gap-4">
        <div
          className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-0.5 bg-gradient-to-r from-transparent via-primary-300 to-transparent sm:block dark:via-primary-700"
          aria-hidden
        />
        {STEPS.map(({ step, title, text, Icon }, i) => (
          <AnimateIn key={step} animation="slide-up" delay={i * 100}>
            <div className="relative flex h-full flex-col rounded-2xl border border-white/80 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-card dark:border-neutral-700/80 dark:bg-neutral-800/80">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-600 text-white shadow-md">
                <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
              </div>
              <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                Adım {step}
              </span>
              <h3 className="mt-2 text-lg font-bold text-neutral-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{text}</p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </AnimateIn>
  );
}

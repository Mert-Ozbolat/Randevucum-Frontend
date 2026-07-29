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
import { AnimateIn } from '@/components/ui/AnimateIn';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';

const FEATURED = {
  title: 'Online randevu sistemi',
  text: 'Müşteriler işletmenizi bulur, müsait saati seçer ve tek dokunuşla randevu oluşturur. Telefon trafiği azalır, randevu akışı kesintisiz devam eder.',
  Icon: CalendarCheck,
};

const OFFERS: { title: string; text: string; Icon: LucideIcon }[] = [
  {
    title: '7/24 erişim',
    text: 'Gece ve hafta sonu dahil, istediği zaman randevu alınabilir.',
    Icon: Zap,
  },
  {
    title: 'Otomatik takvim',
    text: 'Müsaitlik, çakışma kontrolü ve onay süreci sistemde yürür.',
    Icon: LayoutDashboard,
  },
  {
    title: 'WhatsApp bildirimleri',
    text: 'Onay, hatırlatma ve mesajlar WhatsApp ile otomatik gider.',
    Icon: MessageCircle,
  },
  {
    title: 'Personel & hizmet',
    text: 'Hizmet, süre ve çalışanları panelden kolayca yönetin.',
    Icon: Users,
  },
  {
    title: 'Akıllı arama',
    text: 'Kategori, şehir ve harita ile müşteriler size ulaşır.',
    Icon: Search,
  },
  {
    title: 'Yakındaki işletmeler',
    text: 'Konum ve harita ile en yakın seçenekler öne çıkar.',
    Icon: MapPin,
  },
  {
    title: 'Hatırlatma & takip',
    text: 'Yaklaşan randevular için otomatik uyarı; kaçırma azalır.',
    Icon: Bell,
  },
];

function BookingMock() {
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
        Canlı önizleme
      </p>
      <p className="relative mt-2 text-sm font-semibold text-neutral-900 dark:text-white">
        Kuaför Studio · Lefkoşa
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
        <span className="text-xs font-medium text-primary-700 dark:text-primary-200">09:30 seçildi</span>
        <span className="rounded-lg bg-primary-500 px-2.5 py-1 text-[11px] font-semibold text-white">
          Randevu Al
        </span>
      </div>
    </div>
  );
}

export function HomeWhatWeOffer() {
  return (
    <AnimateIn as="section" animation="slide-up" aria-labelledby="home-offer-title">
      <HomeSectionHeader
        eyebrow="Sunulanlar"
        title="Tam olarak ne sunuyoruz?"
        description="Müşteri ve işletme için uçtan uca randevu altyapısı — aramadan hatırlatmaya kadar."
        align="center"
        titleSize="large"
        titleId="home-offer-title"
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3">
        {/* Featured: Online randevu — large */}
        <AnimateIn
          animation="scale-in"
          className="min-w-0 sm:col-span-2 lg:col-span-2 lg:row-span-2"
        >
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
              <FEATURED.Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="relative mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400 sm:mt-5">
              Ana ürün
            </p>
            <h3 className="relative mt-2 text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl lg:text-3xl">
              {FEATURED.title}
            </h3>
            <p className="relative mt-3 max-w-md text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
              {FEATURED.text}
            </p>
            <BookingMock />
          </div>
        </AnimateIn>

        {OFFERS.map(({ title, text, Icon }, i) => {
          const isLast = i === OFFERS.length - 1;
          return (
            <AnimateIn
              key={title}
              animation="slide-up"
              delay={60 + i * 40}
              className={`min-w-0 ${isLast ? 'sm:col-span-2 lg:col-span-2' : ''}`}
            >
              <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-primary-700">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-300">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-3 text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {text}
                </p>
              </div>
            </AnimateIn>
          );
        })}
      </div>
    </AnimateIn>
  );
}

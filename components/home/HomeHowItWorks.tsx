"use client";

import { AnimateIn } from "@/components/ui/AnimateIn";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";

const STEPS = [
  {
    n: "01",
    title: "7/24 erişim",
    text: "Müşteri sizi buluyor; günün her saati, istediği zaman online randevu alıyor. Telefon yetiştiremediğiniz saatlerde bile işletmeniz açık kalır.",
    Visual: StepAccessVisual,
  },
  {
    n: "02",
    title: "Tam otomasyon",
    text: "Sistem randevuları yönetiyor, müsaitliği güncelliyor ve çakışmaları engelliyor. Siz sadece işinize odaklanıp geliyorsunuz.",
    Visual: StepAutomationVisual,
  },
  {
    n: "03",
    title: "WhatsApp entegrasyonu",
    text: "Randevu onayı, hatırlatma ve bilgilendirme mesajları WhatsApp üzerinden otomatik gider. Kaçırılan randevu azalır, iletişim kopmaz.",
    Visual: StepWhatsAppVisual,
  },
] as const;

function StepAccessVisual() {
  return (
    <div className="relative flex h-full min-h-[200px] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-white p-4 dark:from-primary-950/50 dark:to-neutral-900 sm:min-h-[220px]">
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-primary-300/40 blur-2xl dark:bg-primary-500/25"
        aria-hidden
      />
      <p className="relative text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">
        7/24 açık
      </p>
      <div className="relative mt-3 space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
          <span className="text-xs text-neutral-800 dark:text-neutral-100">
            Yeni randevu talebi
          </span>
          <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            02:14
          </span>
        </div>
        <div className="rounded-xl bg-primary-100 px-3 py-2 ring-1 ring-primary-200 dark:bg-primary-950/60 dark:ring-primary-800">
          <p className="text-[11px] font-semibold text-primary-800 dark:text-primary-200">
            Müşteri sizi buldu · Online onaylandı
          </p>
        </div>
        <div className="flex gap-2">
          {["Gece", "Hafta sonu", "Tatil"].map((t) => (
            <span
              key={t}
              className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-600 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepAutomationVisual() {
  const rows = [
    { label: "Müsaitlik güncellendi", done: true },
    { label: "Çakışma engellendi", done: true },
    { label: "Takvim senkron", done: true },
  ];
  return (
    <div className="relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-white p-4 dark:from-primary-950/50 dark:to-neutral-900 sm:min-h-[220px]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">
        Otomasyon
      </p>
      <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
        Sistem yönetiyor
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] text-white">
              ✓
            </span>
            {r.label}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold text-primary-700 dark:text-primary-300">
        Siz sadece geliyorsunuz
      </p>
    </div>
  );
}

function StepWhatsAppVisual() {
  return (
    <div className="relative flex h-full min-h-[200px] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 via-white to-accent-50 p-4 dark:from-primary-950/40 dark:via-neutral-900 dark:to-accent-950/30 sm:min-h-[220px]">
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-primary-400/25 blur-2xl"
        aria-hidden
      />
      <p className="relative text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">
        WhatsApp
      </p>
      <div className="relative mt-3 space-y-2">
        <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-primary-500 px-3 py-2.5 text-[11px] leading-relaxed text-white shadow-sm">
          Randevu hatırlatması: Yarın 09:30 · Kuaför Studio
        </div>
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-white px-3 py-2.5 text-[11px] text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
          Teşekkürler, geliyorum ✓
        </div>
        <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-primary-100 px-3 py-2 text-[11px] font-medium text-primary-800 dark:bg-primary-950/60 dark:text-primary-200">
          Onay + hatırlatma otomatik gönderildi
        </div>
      </div>
    </div>
  );
}

export function HomeHowItWorks() {
  return (
    <AnimateIn
      as="section"
      animation="slide-up"
      aria-labelledby="home-solution-title"
    >
      <HomeSectionHeader
        eyebrow="Çözüm"
        title="Randevucum böyle çözüyor"
        description="İşletmeniz için 7/24 erişim, otomasyon ve WhatsApp ile randevu yönetimi."
        align="center"
        titleSize="large"
        titleId="home-solution-title"
      />

      <ol className="mx-auto mt-10 flex max-w-4xl flex-col gap-6 sm:mt-12 sm:gap-8 lg:gap-10">
        {STEPS.map(({ n, title, text, Visual }, i) => (
          <AnimateIn key={n} animation="slide-up" delay={i * 90} as="li">
            <article className="group overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-card transition duration-300 hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-800 sm:grid sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] sm:items-stretch">
              <div className="min-w-0 p-3 sm:p-4 sm:pr-0">
                <Visual />
              </div>
              <div className="flex min-w-0 flex-col justify-center px-5 pb-6 pt-2 sm:px-8 sm:py-8">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold tracking-tight text-primary-500 dark:text-primary-400 sm:text-4xl md:text-5xl">
                    {n}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-primary-200 to-transparent dark:from-primary-800" />
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white sm:mt-4 sm:text-xl md:text-2xl">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:mt-3 sm:text-base">
                  {text}
                </p>
              </div>
            </article>
          </AnimateIn>
        ))}
      </ol>
    </AnimateIn>
  );
}

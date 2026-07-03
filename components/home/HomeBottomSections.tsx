'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  Building2,
  ChevronDown,
  Clock,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';

const BENEFITS = [
  {
    Icon: Clock,
    title: 'Anında müsaitlik',
    text: 'Gerçek zamanlı takvim; dolu saatler otomatik gizlenir, boş slotları hemen görürsünüz.',
  },
  {
    Icon: MessageCircle,
    title: 'WhatsApp hatırlatmalar',
    text: 'Onaylanan randevular için otomatik mesaj; yaklaşan randevuda geliş onayı alınır.',
  },
  {
    Icon: Heart,
    title: 'Favori işletmeler',
    text: 'Beğendiğiniz salon ve klinikleri kaydedin; tek tıkla tekrar randevu alın.',
  },
  {
    Icon: ShieldCheck,
    title: 'Güvenli kayıt',
    text: 'Randevularınız hesabınızda saklanır; geçmiş ve iptal işlemlerini kolayca yönetin.',
  },
] as const;

/** Footer üstü CTA arka planı */
const CTA_BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80';

const FAQ = [
  {
    q: 'Randevu almak ücretli mi?',
    a: 'Müşteriler için platform tamamen ücretsizdir. Sadece seçtiğiniz işletmenin hizmet ücretini ödersiniz.',
  },
  {
    q: 'Randevumu nasıl iptal ederim?',
    a: 'Giriş yaptıktan sonra Randevularım sayfasından randevunuzu iptal edebilirsiniz. Başlangıç saatinden en geç 12 saat öncesine kadar iptal mümkündür.',
  },
  {
    q: 'İşletme olarak nasıl kayıt olurum?',
    a: 'Kayıt Ol sayfasından işletme hesabı oluşturun, bilgilerinizi tamamlayın ve ücretsiz deneme ile panelinizi açın.',
  },
  {
    q: 'WhatsApp bildirimleri nasıl çalışır?',
    a: 'Randevunuz oluşturulduğunda ve randevu yaklaştığında telefonunuza otomatik hatırlatma gidebilir (PRO paket).',
  },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-neutral-900 dark:text-neutral-50">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <p className="animate-fade-in border-t border-neutral-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          {a}
        </p>
      )}
    </div>
  );
}

export function HomeBottomSections() {
  return (
    <div className="space-y-16 lg:space-y-24">
      {/* Neden Randevucum? */}
      <AnimateIn as="section" animation="slide-up">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Avantajlar
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
            Neden Randevucum?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-neutral-600 dark:text-neutral-400">
            Hem müşteriler hem işletmeler için sade, hızlı ve güvenilir randevu deneyimi.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ Icon, title, text }, i) => (
            <AnimateIn key={title} animation="slide-up" delay={i * 80}>
              <div className="h-full rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-800/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="mt-4 font-bold text-neutral-900 dark:text-neutral-50">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{text}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </AnimateIn>

      {/* Müşteri / İşletme split */}
      <AnimateIn as="section" className="grid gap-6 lg:grid-cols-2" animation="slide-up">
        <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-white to-primary-50/40 p-8 dark:border-neutral-700 dark:from-neutral-800 dark:to-primary-950/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white">
            <Users className="h-6 w-6" strokeWidth={2} aria-hidden />
          </div>
          <h3 className="mt-5 text-xl font-bold text-neutral-900 dark:text-neutral-50">Müşteri misiniz?</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            Kayıt olun, favori işletmelerinizi ekleyin ve birkaç tıkla randevu alın. Tüm randevularınız tek
            panelde.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            {['Ücretsiz hesap', 'Anlık müsaitlik', 'Randevu geçmişi'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Star className="h-4 w-4 shrink-0 text-primary-500" fill="currentColor" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600"
          >
            Hemen kayıt ol
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 text-white dark:border-neutral-600">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Building2 className="h-6 w-6" strokeWidth={2} aria-hidden />
          </div>
          <h3 className="mt-5 text-xl font-bold">İşletme sahibi misiniz?</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">
            Online randevu alın, personelinizi yönetin, analytics ile gelirinizi takip edin. Ücretsiz deneme ile
            başlayın.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-200">
            {['Randevu paneli', 'WhatsApp entegrasyonu', 'Ana sayfa slider reklamı'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Bell className="h-4 w-4 shrink-0 text-primary-400" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
            >
              İşletme kaydı
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Fiyatları gör
            </Link>
          </div>
        </div>
      </AnimateIn>

      {/* SSS */}
      <AnimateIn as="section" className="mx-auto max-w-3xl" animation="slide-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
            Sık sorulan sorular
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Merak ettiklerinize hızlı cevaplar.
          </p>
        </div>
        <div className="mt-8 space-y-3">
          {FAQ.map(({ q, a }, i) => (
            <AnimateIn key={q} animation="fade-in" delay={i * 60}>
              <FaqItem q={q} a={a} />
            </AnimateIn>
          ))}
        </div>
      </AnimateIn>

      {/* Final CTA */}
      <AnimateIn
        as="section"
        className="relative min-h-[280px] overflow-hidden rounded-3xl px-6 py-12 text-center text-white shadow-glow sm:min-h-[300px] sm:px-12 sm:py-14"
        animation="scale-in"
      >
        <Image
          src={CTA_BACKGROUND_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
          unoptimized
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-950/90 via-primary-800/85 to-emerald-950/80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-black/20 blur-2xl"
          aria-hidden
        />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold sm:text-3xl">Bugün randevunuzu planlayın</h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-50/95">
            Binlerce işletme arasından size en uygun olanı bulun — veya kendi işletmenizi platforma taşıyın.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/business"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-soft transition duration-300 hover:bg-primary-50 hover:shadow-glow"
            >
              İşletmeleri keşfet
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:bg-white/20"
            >
              Ücretsiz başla
            </Link>
          </div>
        </div>
      </AnimateIn>
    </div>
  );
}

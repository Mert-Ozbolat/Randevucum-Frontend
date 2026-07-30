'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const switchLocale = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 ${
          compact ? 'p-2 text-xs' : 'px-2.5 py-2 text-xs sm:text-sm'
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('language')}
        title={localeNames[locale]}
      >
        <Globe className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        {!compact && (
          <span className="hidden uppercase tracking-wide sm:inline">{locale}</span>
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('language')}
          className="absolute right-0 z-[60] mt-2 min-w-[9rem] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {locales.map((code) => (
            <li key={code} role="option" aria-selected={code === locale}>
              <button
                type="button"
                onClick={() => switchLocale(code)}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition ${
                  code === locale
                    ? 'bg-primary-50 font-semibold text-primary-800 dark:bg-primary-950/50 dark:text-primary-200'
                    : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{localeNames[code]}</span>
                <span className="text-xs uppercase text-neutral-400">{code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

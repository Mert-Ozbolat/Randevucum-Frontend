import { defineRouting } from 'next-intl/routing';

export const locales = ['tr', 'en', 'ru'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'tr',
  localePrefix: 'as-needed',
});

export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  ru: 'Русский',
};

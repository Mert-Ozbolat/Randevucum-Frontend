# Dil desteği (i18n) — next-intl

## Diller

| Kod | Dil | URL örneği |
|-----|-----|------------|
| `tr` | Türkçe (varsayılan) | `/pricing` |
| `en` | English | `/en/pricing` |
| `ru` | Русский | `/ru/pricing` |

Varsayılan dil (`tr`) URL prefix kullanmaz (`localePrefix: as-needed`).

## Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `i18n/routing.ts` | Locale listesi ve routing |
| `i18n/request.ts` | next-intl sunucu yapılandırması |
| `i18n/navigation.ts` | `Link`, `useRouter`, `usePathname` (locale-aware) |
| `messages/tr.json` | Türkçe çeviriler |
| `messages/en.json` | İngilizce çeviriler |
| `messages/ru.json` | Rusça çeviriler |
| `middleware.ts` | Dil yönlendirme + dashboard auth |
| `components/layout/LanguageSwitcher.tsx` | Navbar dil seçici |

## Çevrilen bölümler (ilk faz)

- Navbar + Footer
- Ana sayfa hero + paketler bandı
- Fiyatlar sayfası + paket kartları
- Dil değiştirici (TR / EN / RU)

## Yeni metin eklemek

1. Üç JSON dosyasına aynı anahtarı ekleyin (`messages/tr.json`, `en.json`, `ru.json`)
2. Bileşende: `const t = useTranslations('namespace');` → `t('key')`
3. Linkler için `next/link` yerine `@/i18n/navigation` içindeki `Link` kullanın

## Sonraki adımlar

- Dashboard sayfaları
- Yasal metinler (`legal/content.ts`)
- Backend API hata mesajları (`Accept-Language`)

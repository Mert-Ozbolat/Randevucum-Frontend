# Dil desteği (i18n) — hazırlık

Bu klasör ve `messages/` altındaki dosyalar iskelet olarak oluşturuldu.  
Uygulamaya bağlama (Next.js, hook, dil değiştirici vb.) henüz yapılmadı.

## Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `i18n/config.json` | Varsayılan dil (`tr`), desteklenen diller (`tr`, `en`) |
| `messages/tr.json` | Türkçe çeviriler (namespace’lere göre) |
| `messages/en.json` | İngilizce çeviriler |

## Namespace’ler

- `common` — genel butonlar, yükleme, evet/hayır
- `nav` — navbar
- `footer` — footer linkleri
- `home` — ana sayfa
- `pricing` — paketler / fiyatlar
- `auth` — giriş, kayıt
- `business` — işletme sayfaları, keşfet
- `dashboard` — işletme / müşteri / personel paneli
- `reservation` — randevu akışı
- `subscription` — abonelik
- `legal` — KVKK, sözleşmeler
- `errors` — hata mesajları

## Sonraki adım (bekleniyor)

Entegrasyon için karar verilecekler:

1. Kütüphane: `next-intl`, `react-i18next`, veya hafif özel çözüm
2. URL yapısı: `/tr/...`, `/en/...` mi yoksa cookie/localStorage ile mi?
3. Hangi sayfalardan başlanacak (ör. ana sayfa + navbar önce)

Talimatınız gelince devam edilir.

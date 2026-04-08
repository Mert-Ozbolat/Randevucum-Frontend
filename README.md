# Web Rezervasyon – Frontend

Next.js 14 (App Router) + Tailwind CSS ile çok kiracılı randevu platformu arayüzü.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Zustand** (auth state)
- **Axios** (API)
- **Stripe** (abonelik ödemesi, opsiyonel)
- **TypeScript**

## Kurulum

```bash
cd frontend
npm install
cp .env.local.example .env.local
# .env.local içinde NEXT_PUBLIC_API_URL ve isteğe bağlı Stripe anahtarlarını düzenle
npm run dev
```

Backend API’nin çalışıyor olması gerekir (varsayılan: `http://localhost:3000`).

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (örn. http://localhost:3000) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (opsiyonel) |
| `STRIPE_SECRET_KEY` | Stripe secret key – sadece API route için (opsiyonel) |
| `STRIPE_PRICE_ID_MONTHLY` | Aylık abonelik price ID (opsiyonel) |

## Sayfalar

- **/** – Ana sayfa
- **/login**, **/register** – Giriş / Kayıt (hesap türü: Bireysel / İşletme)
- **/pricing** – Fiyatlar
- **/business** – İşletme listesi (kategori filtreli)
- **/business/[id]** – İşletme detay + hizmetler
- **/business/[id]/reserve** – Randevu akışı (tarih → saat → onay)
- **/dashboard** – Role göre yönlendirme (işletme / müşteri)
- **/dashboard/business/** – İşletme paneli (özet, bilgi, hizmetler, personel, randevular, abonelik)
- **/dashboard/customer/reservations** – Randevularım
- **/dashboard/customer/profile** – Profil

## Klasör Yapısı

```
app/
  (public)/          # Navbar’lı genel sayfalar
  dashboard/         # Sidebar’lı panel
  api/               # Stripe checkout API route
components/
lib/                 # api, auth, constants
store/               # Zustand auth
```

## Stripe

Abonelik ödemesi için:

1. Stripe hesabında bir Product + recurring Price oluştur.
2. `STRIPE_SECRET_KEY` ve `STRIPE_PRICE_ID_MONTHLY` (veya kullandığın price ID) ile `.env.local` doldur.
3. Abonelik sayfasında “Ödeme Yap” benzeri bir buton, `/api/stripe-create-checkout` POST ile session oluşturup dönen URL’e yönlendirir.
4. Ödeme sonrası webhook ile backend’de abonelik kaydı güncellenebilir (backend tarafında Stripe webhook endpoint gerekir).

## Lisans

ISC
# webrezervasyon
# Randevucum
# Randevucum
# Randevucum
# Randevucum

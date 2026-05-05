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
# .env.local içinde NEXT_PUBLIC_API_URL ayarlayın; Stripe anahtarları backend .env dosyasındadır
npm run dev
```

Backend API’nin çalışıyor olması gerekir (varsayılan: `http://localhost:5001`).

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (örn. http://localhost:5001) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | İleride client Stripe için (opsiyonel) |

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
  api/               # (boş / ileride)
components/
lib/                 # api, auth, constants
store/               # Zustand auth
```

## Stripe (abonelik)

Checkout ve webhook **Express backend** üzerinde: `backend/.env` ve `backend/README.md` içindeki Stripe bölümüne bakın. Panelde **Abonelik** sayfası, Stripe hazırsa “Kredi kartı ile abonelik öde” ile Checkout’a yönlendirir.

## Lisans

ISC

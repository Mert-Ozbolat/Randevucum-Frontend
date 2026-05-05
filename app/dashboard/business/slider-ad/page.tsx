'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api, getApiErrorMessage } from '@/lib/api';
import { isImageKitReady, uploadFileToImageKit } from '@/lib/imagekitUpload';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Megaphone, ExternalLink } from 'lucide-react';

interface Business {
  _id: string;
  name: string;
  homeSliderPromo?: {
    headline?: string;
    subline?: string;
    imageUrl?: string;
    paidUntil?: string;
  };
}

/** İstemci tarafı yükleme üst sınırı (5 MB) — backend ile uyumlu */
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function SliderAdPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [headline, setHeadline] = useState('');
  const [subline, setSubline] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setError('');
    api
      .get<{ data: Business[] }>('/business')
      .then((res) => {
        const list = res.data.data || [];
        const b = list[0];
        if (b) {
          setBusiness(b);
          const p = b.homeSliderPromo;
          setHeadline(p?.headline || '');
          setSubline(p?.subline || '');
          setImageUrl(p?.imageUrl || '');
        } else {
          setBusiness(null);
        }
      })
      .catch(() => setError('İşletme yüklenemedi.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const paidUntil = business?.homeSliderPromo?.paidUntil
    ? new Date(business.homeSliderPromo.paidUntil)
    : null;
  const now = new Date();
  const hasActiveSlot = !!(paidUntil && paidUntil > now);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > MAX_FILE_BYTES) {
      setError('Dosya çok büyük (maks. 5 MB). Daha küçük bir görsel seçin veya sıkıştırın.');
      return;
    }
    setError('');
    if (!isImageKitReady()) {
      setError(
        'ImageKit yapılandırması eksik. NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ve NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ekleyin.'
      );
      e.target.value = '';
      return;
    }
    setFileUploading(true);
    try {
      const url = await uploadFileToImageKit(file, { folder: '/home-slider-promo' });
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel yüklenemedi.');
    } finally {
      setFileUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    if (!hasActiveSlot) {
      setError('Önce slider reklam süresi satın almalısınız.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/business/${business._id}/home-slider-promo`, {
        headline: headline.trim(),
        subline: subline.trim(),
        imageUrl: imageUrl.trim(),
      });
      setSuccess('Reklam içeriği kaydedildi. Ana sayfada birkaç dakika içinde görünebilir.');
      load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePurchase = async () => {
    if (!business) return;
    setPurchasing(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post<{ data: { paidUntil: string; daysAdded: number } }>(
        `/business/${business._id}/home-slider-promo/purchase`,
        { days: 30 }
      );
      const p = res.data.data;
      setSuccess(
        `Slider süresi ${p?.daysAdded ?? 30} gün eklendi. Bitiş: ${p?.paidUntil ? new Date(p.paidUntil).toLocaleString('tr-TR') : ''}`
      );
      load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Ana sayfa reklamı</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Önce bir işletme oluşturun.</p>
        <Link
          href="/dashboard/business/info"
          className="font-semibold text-primary-600 dark:text-primary-400"
        >
          İşletme bilgileri
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          <Megaphone className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Ana sayfa slider reklamı</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Kendi görselinizi ve metinlerinizi ekleyin. &quot;Detaya git&quot; tıklanınca ziyaretçiler işletme sayfanıza gider.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/70 dark:bg-red-950/80 dark:text-red-100">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-primary-300 bg-primary-50 p-3 text-sm text-primary-950 dark:border-primary-600 dark:bg-primary-950/70 dark:text-primary-50">
          {success}
        </div>
      )}

      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Reklam süresi</h2>
        {hasActiveSlot && paidUntil ? (
          <p className="text-sm text-neutral-800 dark:text-neutral-200">
            Aktif süre: <strong className="text-neutral-900 dark:text-white">{paidUntil.toLocaleString('tr-TR')}</strong>{' '}
            tarihine kadar.
          </p>
        ) : (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Henüz aktif bir slider paketiniz yok. Aşağıdaki butonla demo süre satın alabilirsiniz (üretimde Stripe
            ödemesi bağlanır).
          </p>
        )}
        <Button type="button" loading={purchasing} onClick={handlePurchase} variant="primary">
          {hasActiveSlot ? 'Süreyi 30 gün uzat (demo)' : '30 günlük slider paketi al (demo)'}
        </Button>
      </Card>

      <form onSubmit={handleSave}>
        <Card className="space-y-5 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Reklam içeriği</h2>
          {!hasActiveSlot && (
            <p className="rounded-lg border border-amber-300/80 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-600/60 dark:bg-amber-950/40 dark:text-amber-100">
              İçerik kaydetmek için önce ücretli süre satın almalısınız.
            </p>
          )}

          <div>
            <Input
              label="Başlık"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={business.name}
              disabled={!hasActiveSlot}
            />
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Boş bırakırsanız işletme adınız kullanılır.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
              Alt metin (isteğe bağlı)
            </label>
            <textarea
              value={subline}
              onChange={(e) => setSubline(e.target.value)}
              rows={2}
              disabled={!hasActiveSlot}
              placeholder="Örn. Bu hafta %20 indirim — online randevu"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 disabled:bg-neutral-100 dark:border-neutral-500 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus:border-primary-400 dark:disabled:bg-neutral-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
              Slider görseli
            </label>
            <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
              Dikey veya kareye yakın görseller daha iyi görünür. Dosya başına maks. 5 MB.
            </p>
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative h-40 w-full max-w-[200px] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-500 dark:bg-neutral-800/80">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Önizleme" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-500 dark:text-neutral-400">
                    Önizleme
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFile}
                  disabled={!hasActiveSlot}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!hasActiveSlot || fileUploading}
                  loading={fileUploading}
                  onClick={() => fileRef.current?.click()}
                >
                  Bilgisayardan yükle
                </Button>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  İsterseniz harici bir görsel URL’si de yapıştırabilirsiniz:
                </p>
                <input
                  type="url"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={!hasActiveSlot}
                  placeholder="https://..."
                  className="w-full max-w-md rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 disabled:bg-neutral-100 dark:border-neutral-500 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus:border-primary-400 dark:disabled:bg-neutral-900"
                />
              </div>
            </div>
          </div>

          <Button type="submit" loading={saving} disabled={!hasActiveSlot}>
            Reklamı kaydet
          </Button>
        </Card>
      </form>

      <Link
        href={`/business/${business._id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 underline-offset-2 hover:underline dark:text-primary-300"
      >
        İşletme sayfamı önizle
        <ExternalLink className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

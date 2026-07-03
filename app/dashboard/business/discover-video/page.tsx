'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api, getApiErrorMessage } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { isImageKitReady, uploadFileToImageKit } from '@/lib/imagekitUpload';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Clapperboard, ExternalLink, Eye, Trash2 } from 'lucide-react';
import { formatViewCount } from '@/lib/businessDiscoverMedia';

interface Business {
  _id: string;
  name: string;
  promoVideoUrl?: string | null;
  promoVideoCaption?: string | null;
  promoVideoViews?: number | null;
}

const MAX_VIDEO_BYTES = 30 * 1024 * 1024;
const ACCEPTED_VIDEO = 'video/mp4,video/quicktime,video/webm';

export default function DiscoverVideoPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [promoVideoUrl, setPromoVideoUrl] = useState('');
  const [promoVideoCaption, setPromoVideoCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setError('');
    fetchMyBusinesses<{ data: Business[] }>()
      .then((res) => {
        const b = (res.data.data || [])[0];
        if (b) {
          setBusiness(b);
          setPromoVideoUrl(b.promoVideoUrl || '');
          setPromoVideoCaption(b.promoVideoCaption || '');
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Lütfen MP4, MOV veya WebM formatında bir video seçin.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError('Video en fazla 30 MB olabilir. Daha kısa veya sıkıştırılmış bir video deneyin.');
      e.target.value = '';
      return;
    }
    setError('');
    setSuccess('');
    if (!isImageKitReady()) {
      setError(
        'ImageKit yapılandırması eksik. NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ve NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ekleyin.'
      );
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFileToImageKit(file, { folder: '/business-discover-videos' });
      setPromoVideoUrl(url);
      setSuccess('Video yüklendi. Kaydet’e basarak Keşfet’te yayınlayın.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video yüklenemedi.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put<{ data: Business }>(`/business/${business._id}`, {
        promoVideoUrl: promoVideoUrl.trim(),
        promoVideoCaption: promoVideoCaption.trim(),
      });
      const updated = data.data;
      setBusiness(updated);
      setPromoVideoUrl(updated.promoVideoUrl || '');
      setPromoVideoCaption(updated.promoVideoCaption || '');
      setSuccess(
        updated.promoVideoUrl
          ? 'Video Keşfet’te yayında! Müşteriler artık videonuzu izleyebilir.'
          : 'Keşfet videosu kaldırıldı.'
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = () => {
    setPromoVideoUrl('');
    setSuccess('');
    setError('');
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!business) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-600 dark:text-neutral-300">Önce işletme bilgilerinizi oluşturun.</p>
        <Link
          href="/dashboard/business/info"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline"
        >
          İşletme bilgisi →
        </Link>
      </Card>
    );
  }

  const hasVideo = Boolean(promoVideoUrl.trim());
  const viewCount = business.promoVideoViews ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          <Clapperboard className="h-7 w-7 text-primary-500" strokeWidth={1.75} aria-hidden />
          Keşfet videosu
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Kısa bir tanıtım videosu yükleyin. Müşteriler{' '}
          <Link href="/business/discover" className="font-medium text-primary-600 hover:underline">
            Keşfet
          </Link>{' '}
          bölümünde Reels gibi izleyebilir.
        </p>
        {hasVideo && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            <Eye className="h-4 w-4 text-neutral-500" strokeWidth={2} aria-hidden />
            {formatViewCount(viewCount)} izlenme
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-100">
          {success}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="relative aspect-[9/16] max-h-[420px] w-full bg-neutral-900">
          {hasVideo ? (
            <video
              key={promoVideoUrl}
              src={promoVideoUrl}
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-neutral-400">
              <Clapperboard className="h-12 w-12 opacity-40" strokeWidth={1.5} aria-hidden />
              <p className="text-sm">Henüz video yok — dikey (9:16) kısa video önerilir</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4 p-5">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_VIDEO}
            className="hidden"
            onChange={handleFile}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? 'Yükleniyor…' : hasVideo ? 'Videoyu değiştir' : 'Video yükle'}
            </Button>
            {hasVideo && (
              <Button type="button" variant="secondary" onClick={handleRemove}>
                <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
                Kaldır
              </Button>
            )}
          </div>

          <div>
            <label htmlFor="promoVideoCaption" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Video açıklaması (isteğe bağlı)
            </label>
            <Input
              id="promoVideoCaption"
              value={promoVideoCaption}
              onChange={(e) => setPromoVideoCaption(e.target.value)}
              placeholder="Örn: Yeni sezon saç modelleri — randevu için kaydırın"
              maxLength={200}
            />
            <p className="mt-1 text-xs text-neutral-500">{promoVideoCaption.length}/200</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={saving || uploading}>
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
            {hasVideo && (
              <Link
                href="/business/discover"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Keşfet&apos;te gör
              </Link>
            )}
          </div>
        </form>
      </Card>

      <Card className="p-5 text-sm text-neutral-600 dark:text-neutral-400">
        <p className="font-medium text-neutral-800 dark:text-neutral-200">İpuçları</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>15–60 saniyelik dikey video en iyi sonucu verir</li>
          <li>MP4 formatı, en fazla 30 MB</li>
          <li>Video kaydedildikten sonra Keşfet akışında görünür</li>
        </ul>
      </Card>
    </div>
  );
}

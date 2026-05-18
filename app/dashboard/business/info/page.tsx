'use client';

import { useEffect, useState, useRef } from 'react';
import { api, getApiErrorMessage } from '@/lib/api';
import { KKTC_CITIES } from '@/lib/constants';
import { BUSINESS_CATEGORY_GROUPS, SUBCATEGORY_TO_BUSINESS_TYPE } from '@/lib/businessCategories';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoogleMapPinPicker } from '@/components/business/GoogleMapPinPicker';
import { isImageKitReady, uploadFileToImageKit } from '@/lib/imagekitUpload';
import { formatTrMobile, phoneDigitsOnly, phoneInputFromStored } from '@/lib/phone';
import { ImageIcon } from 'lucide-react';
import { dispatchBusinessSetupRefresh } from '@/lib/businessSetupRefresh';

interface Business {
  _id: string;
  name: string;
  businessType: string;
  area?: string;
  profession?: string;
  mainCategory?: string;
  subCategory?: string;
  location?: { lat?: number; lng?: number };
  address?: { street?: string; city?: string; district?: string; postalCode?: string };
  phone?: string;
  email?: string;
  description?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  workingHours?: { dayOfWeek: number; open: string; close: string; isClosed: boolean }[];
  breakTimes?: { start: string; end: string }[];
}

const DAYS = [0, 1, 2, 3, 4, 5, 6];

function mapSubCategoryToBusinessType(subCategory?: string) {
  if (!subCategory) return 'other';
  return SUBCATEGORY_TO_BUSINESS_TYPE[subCategory] || 'other';
}

function defaultFormState(): Partial<Business> {
  return {
    name: '',
    phone: '',
    email: '',
    mainCategory: '',
    subCategory: '',
    businessType: 'other',
    location: { lat: 35.1856, lng: 33.3823 },
    address: { street: '', city: '', district: '' },
    description: '',
    imageUrl: '',
    workingHours: DAYS.map((d) => ({
      dayOfWeek: d,
      open: '09:00',
      close: '18:00',
      isClosed: d === 0,
    })),
    breakTimes: [{ start: '12:00', end: '13:00' }],
  };
}

function buildPayload(form: Partial<Business>) {
  return {
    name: form.name?.trim(),
    phone: form.phone?.trim(),
    email: form.email?.trim() || undefined,
    mainCategory: form.mainCategory || undefined,
    subCategory: form.subCategory || undefined,
    area: form.mainCategory || undefined,
    profession: form.subCategory || undefined,
    businessType: mapSubCategoryToBusinessType(form.subCategory),
    location: form.location,
    address: form.address,
    description: form.description?.trim() || undefined,
    imageUrl: form.imageUrl || undefined,
    workingHours: form.workingHours,
    breakTimes: form.breakTimes,
  };
}

function businessToForm(b: Business): Partial<Business> {
  return {
    name: b.name,
    businessType: b.businessType,
    mainCategory: b.area || b.mainCategory,
    subCategory: b.profession || b.subCategory,
    location: b.location || { lat: 35.1856, lng: 33.3823 },
    address: b.address || { street: '', city: '', district: '' },
    phone: phoneInputFromStored(b.phone),
    email: b.email || '',
    description: b.description || '',
    workingHours: b.workingHours?.length
      ? b.workingHours
      : defaultFormState().workingHours,
    breakTimes: b.breakTimes || [{ start: '12:00', end: '13:00' }],
    imageUrl: b.imageUrl || '',
  };
}

export default function BusinessInfoPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<Partial<Business>>(defaultFormState);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<{ data: Business[] }>('/business')
      .then((res) => {
        const list = res.data.data || [];
        if (list[0]) {
          const b = list[0];
          setBusiness(b);
          setForm(businessToForm(b));
          if (b.imageUrl) setProfilePreview(b.imageUrl);
        }
      })
      .catch(() => setError('İşletme yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name?.trim()) {
      setError('İşletme adı zorunludur.');
      return;
    }
    if (!form.mainCategory?.trim() || !form.subCategory?.trim()) {
      setError('Alan ve meslek seçimi zorunludur.');
      return;
    }
    if (phoneDigitsOnly(form.phone || '').length < 10) {
      setError('Geçerli bir işletme telefon numarası girin.');
      return;
    }

    const payload = buildPayload(form);
    setSaving(true);
    try {
      if (business?._id) {
        const { data } = await api.put<{ data: Business }>(`/business/${business._id}`, payload);
        const updated = data.data;
        setBusiness(updated);
        setForm(businessToForm(updated));
        if (updated.imageUrl) setProfilePreview(updated.imageUrl);
      } else {
        const { data } = await api.post<{ data: Business }>('/business', payload);
        const created = data.data;
        setBusiness(created);
        setForm(businessToForm(created));
        if (created.imageUrl) setProfilePreview(created.imageUrl);
      }
      dispatchBusinessSetupRefresh();
      setSuccess('İşletme bilgileri kaydedildi.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setError('');
    setSuccess('');
    if (!isImageKitReady()) {
      setError(
        'ImageKit yapılandırması eksik. NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ve NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ekleyin.'
      );
      e.target.value = '';
      return;
    }
    setPhotoUploading(true);
    try {
      const url = await uploadFileToImageKit(file, { folder: '/business-covers' });
      setProfilePreview(url);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel yüklenemedi.');
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };

  const selectedGroup = BUSINESS_CATEGORY_GROUPS.find((g) => g.name === (form.mainCategory || ''));
  const subcategories = selectedGroup?.subcategories ?? [];
  const isNew = !business?._id;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">İşletme Bilgileri</h1>

      {(isNew || business?.isActive === false) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {isNew
            ? 'İşletme bilgilerinizi doldurup kaydedin. Müşterilere görünmeden önce hizmet, personel ve çalışma saatlerini de tamamlamanız gerekir.'
            : 'İşletmeniz henüz müşterilere görünmüyor. Telefon, konum, açıklama (en az 8 karakter), en az bir hizmet, personel ve açık çalışma günü ekledikten sonra otomatik yayına alınır.'}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
              {success}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
              Profil / kapak fotoğrafı
            </label>
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-neutral-200 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800">
                {profilePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePreview} alt="Profil" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-neutral-400" strokeWidth={1.25} aria-hidden />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={photoUploading}
                  disabled={photoUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Fotoğraf seç
                </Button>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  JPG, PNG veya WebP. Kaydet ile birlikte işletme kaydına yazılır.
                </p>
              </div>
            </div>
          </div>

          <Input
            label="İşletme adı"
            value={form.name || ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-200">Alan</label>
            <select
              value={form.mainCategory || ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  mainCategory: e.target.value,
                  subCategory: '',
                  businessType: 'other',
                }))
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              required
            >
              <option value="">Alan seçin</option>
              {BUSINESS_CATEGORY_GROUPS.map((g) => (
                <option key={g.name} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-200">Meslek</label>
            <select
              value={form.subCategory || ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  subCategory: e.target.value,
                  businessType: mapSubCategoryToBusinessType(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-100 disabled:text-neutral-500 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:disabled:bg-neutral-900 dark:disabled:text-neutral-500"
              disabled={!form.mainCategory}
              required
            >
              <option value="">{form.mainCategory ? 'Meslek seçin' : 'Önce alan seçin'}</option>
              {subcategories.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="İşletme telefonu"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="0 5xx xxx xx xx"
            value={form.phone || ''}
            onChange={(e) => {
              const digits = phoneDigitsOnly(e.target.value);
              if (digits.length <= 11) setForm((f) => ({ ...f, phone: formatTrMobile(digits) }));
            }}
          />

          <GoogleMapPinPicker
            value={form.location}
            onChange={(loc) => setForm((f) => ({ ...f, location: loc ?? f.location }))}
          />

          <Input
            label="E-posta (isteğe bağlı)"
            type="email"
            value={form.email || ''}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />

          <div className="space-y-3">
            <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-200">Adres</span>
            <Input
              label="İlçe"
              value={form.address?.district || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: { ...f.address, district: e.target.value } }))
              }
              placeholder="Örn. İskele"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-200">Şehir</label>
              <select
                value={form.address?.city || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: { ...f.address, city: e.target.value } }))
                }
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              >
                <option value="">Şehir seçin</option>
                {KKTC_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Açık adres"
              value={form.address?.street || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: { ...f.address, street: e.target.value } }))
              }
              placeholder="Sokak, bina no, kat vb."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-200">Açıklama</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="İşletmenizi kısaca anlatın (yayın için en az 8 karakter önerilir)."
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500"
            />
          </div>

          <Button type="submit" loading={saving}>
            {isNew ? 'İşletmeyi kaydet' : 'Kaydet'}
          </Button>
        </Card>
      </form>
    </div>
  );
}

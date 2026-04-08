'use client';

import { useEffect, useState, useRef } from 'react';
import { api, getApiErrorMessage } from '@/lib/api';
import { KKTC_CITIES } from '@/lib/constants';
import { BUSINESS_CATEGORY_GROUPS, SUBCATEGORY_TO_BUSINESS_TYPE } from '@/lib/businessCategories';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoogleMapPinPicker } from '@/components/business/GoogleMapPinPicker';
import { ImageIcon } from 'lucide-react';

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
  workingHours?: { dayOfWeek: number; open: string; close: string; isClosed: boolean }[];
  breakTimes?: { start: string; end: string }[];
}

const DAYS = [0, 1, 2, 3, 4, 5, 6];
const DAY_LABELS: Record<number, string> = {
  0: 'Pazar', 1: 'Pazartesi', 2: 'Salı', 3: 'Çarşamba', 4: 'Perşembe', 5: 'Cuma', 6: 'Cumartesi',
};

function mapSubCategoryToBusinessType(subCategory?: string) {
  if (!subCategory) return 'other';
  return SUBCATEGORY_TO_BUSINESS_TYPE[subCategory] || 'other';
}

function CreateBusinessForm({ onCreated }: { onCreated: (b: Business) => void }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    mainCategory: '',
    subCategory: '',
    location: { lat: 35.1856, lng: 33.3823 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedGroup = BUSINESS_CATEGORY_GROUPS.find((g) => g.name === form.mainCategory);
  const subcategories = selectedGroup?.subcategories ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        mainCategory: form.mainCategory || undefined,
        subCategory: form.subCategory || undefined,
        area: form.mainCategory || undefined,
        profession: form.subCategory || undefined,
        location: form.location || undefined,
        businessType: mapSubCategoryToBusinessType(form.subCategory),
      };
      const { data } = await api.post<{ data: Business }>('/business', payload);
      onCreated(data.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <h2 className="text-lg font-bold text-neutral-900">Yeni işletme oluştur</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <Input label="İşletme adı" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-900">Alan</label>
          <select
            value={form.mainCategory}
            onChange={(e) =>
              setForm((f) => ({ ...f, mainCategory: e.target.value, subCategory: '' }))
            }
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none"
            required
          >
            <option value="">Alan seçin</option>
            {BUSINESS_CATEGORY_GROUPS.map((g) => (
              <option key={g.name} value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-900">Meslek</label>
          <select
            value={form.subCategory}
            onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value }))}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500"
            disabled={!form.mainCategory}
            required
          >
            <option value="">{form.mainCategory ? 'Meslek seçin' : 'Önce alan seçin'}</option>
            {subcategories.map((sc) => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-neutral-600">
            Bu seçim arama ve filtre için kaydedilir.
          </p>
        </div>
        <GoogleMapPinPicker
          value={form.location}
          onChange={(loc) => setForm((f) => ({ ...f, location: loc ?? f.location }))}
        />
        <Input label="Telefon" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <Input label="E-posta" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <Button type="submit" loading={loading}>Oluştur</Button>
      </form>
    </Card>
  );
}

export default function BusinessInfoPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<Business>>({});
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<{ data: Business[] }>('/business')
      .then((res) => {
        const list = res.data.data || [];
        if (list[0]) {
          setBusiness(list[0]);
          const b = list[0];
          setForm({
            name: b.name,
            businessType: b.businessType,
            mainCategory: b.area || b.mainCategory,
            subCategory: b.profession || b.subCategory,
            location: b.location || { lat: 35.1856, lng: 33.3823 },
            address: b.address || {},
            phone: b.phone,
            email: b.email,
            description: b.description,
            workingHours: b.workingHours?.length
              ? b.workingHours
              : DAYS.map((d) => ({ dayOfWeek: d, open: '09:00', close: '18:00', isClosed: d === 0 })),
            breakTimes: b.breakTimes || [{ start: '12:00', end: '13:00' }],
          });
          if (b.imageUrl) setProfilePreview(b.imageUrl);
        }
      })
      .catch(() => setError('İşletme yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        area: form.mainCategory || undefined,
        profession: form.subCategory || undefined,
      };
      await api.put(`/business/${business._id}`, payload);
      setBusiness({ ...business, ...payload });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
    // TODO: API'ye yükleme (backend imageUrl / upload endpoint eklendiğinde)
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
      <CreateBusinessForm
        onCreated={(b) => {
          setBusiness(b);
          setForm({
            name: b.name,
            businessType: b.businessType,
            mainCategory: b.area || b.mainCategory,
            subCategory: b.profession || b.subCategory,
            address: b.address,
            phone: b.phone,
            email: b.email,
            description: b.description,
          });
        }}
      />
    );
  }

  const selectedGroup = BUSINESS_CATEGORY_GROUPS.find((g) => g.name === (form.mainCategory || ''));
  const subcategories = selectedGroup?.subcategories ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">İşletme Bilgileri</h1>
      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {/* Profil foto yükleme */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">Profil / kapak fotoğrafı</label>
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-neutral-200 bg-neutral-100">
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
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Fotoğraf seç
                </Button>
                <p className="mt-1 text-xs text-neutral-600">JPG, PNG. Yükleme API bağlandığında kaydedilecek.</p>
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
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">Alan</label>
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
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Alan seçin</option>
              {BUSINESS_CATEGORY_GROUPS.map((g) => (
                <option key={g.name} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">Meslek</label>
            <select
              value={form.subCategory || ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  subCategory: e.target.value,
                  businessType: mapSubCategoryToBusinessType(e.target.value),
                }))
              }
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-100 disabled:text-neutral-500"
              disabled={!form.mainCategory}
            >
              <option value="">{form.mainCategory ? 'Meslek seçin' : 'Önce alan seçin'}</option>
              {subcategories.map((sc) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-600">
              Kaydet dediğinizde seçimler işletmeye yazılır.
            </p>
          </div>
          <Input
            label="Telefon"
            value={form.phone || ''}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <GoogleMapPinPicker
            value={form.location}
            onChange={(loc) => setForm((f) => ({ ...f, location: loc ?? f.location }))}
          />
          <Input
            label="E-posta"
            type="email"
            value={form.email || ''}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />

          {/* Adres: İlçe, Şehir, Açık adres */}
          <div className="space-y-3">
            <span className="block text-sm font-medium text-neutral-900">Adres</span>
            <Input
              label="İlçe"
              value={form.address?.district || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: { ...f.address, district: e.target.value } }))
              }
              placeholder="Örn. İskele"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-900">Şehir</label>
              <select
                value={form.address?.city || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: { ...f.address, city: e.target.value } }))
                }
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Şehir seçin</option>
                {KKTC_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
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
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">Açıklama</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <Button type="submit" loading={saving}>
            Kaydet
          </Button>
        </Card>
      </form>
    </div>
  );
}

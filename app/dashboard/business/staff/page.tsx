'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, getApiErrorMessage } from '@/lib/api';
import { isImageKitReady, uploadFileToImageKit } from '@/lib/imagekitUpload';
import { dispatchBusinessSetupRefresh } from '@/lib/businessSetupRefresh';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { ImageIcon, User } from 'lucide-react';

interface Business {
  _id: string;
}

interface StaffQuota {
  planKey?: string;
  staffLimit?: number | null;
  staffCount?: number;
  canAddStaff?: boolean;
}

interface Staff {
  _id: string;
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  canViewOwnReservations?: boolean;
  userId?: { _id: string; email?: string; firstName?: string; lastName?: string } | null;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '?';
}

export default function StaffPage() {
  const { addToast } = useToast();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [quota, setQuota] = useState<StaffQuota | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    imageUrl: '',
    canViewOwnReservations: false,
    linkUserEmail: '',
  });
  const [createPhotoUploading, setCreatePhotoUploading] = useState(false);
  const createFileRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    imageUrl: '',
    canViewOwnReservations: false,
    linkUserEmail: '',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editPhotoUploading, setEditPhotoUploading] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const loadStaffData = async (bid: string) => {
    const [staffRes, subRes] = await Promise.all([
      api.get<{ data: Staff[] }>(`/staff/business/${bid}`),
      api.get<{ data: StaffQuota }>(`/subscription/status/${bid}`).catch(() => null),
    ]);
    setStaff(staffRes.data.data || []);
    if (subRes?.data?.data) {
      const q = subRes.data.data;
      setQuota({
        planKey: q.planKey,
        staffLimit: q.staffLimit ?? null,
        staffCount: q.staffCount ?? (staffRes.data.data || []).length,
        canAddStaff: q.canAddStaff,
      });
    }
  };

  useEffect(() => {
    api
      .get<{ data: Business[] }>('/business')
      .then((res) => {
        const list = res.data.data || [];
        if (list[0]) {
          setBusinessId(list[0]._id);
          return loadStaffData(list[0]._id);
        }
        return null;
      })
      .catch(() => setError('Yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreatePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Görsel en fazla 5 MB olabilir.');
      e.target.value = '';
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
    setCreatePhotoUploading(true);
    try {
      const url = await uploadFileToImageKit(file, { folder: '/staff-profiles' });
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükleme başarısız.');
    } finally {
      setCreatePhotoUploading(false);
      e.target.value = '';
    }
  };

  const handleEditPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Görsel en fazla 5 MB olabilir.');
      e.target.value = '';
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
    setEditPhotoUploading(true);
    try {
      const url = await uploadFileToImageKit(file, { folder: '/staff-profiles' });
      setEditForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükleme başarısız.');
    } finally {
      setEditPhotoUploading(false);
      e.target.value = '';
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setError('');
    try {
      const res = await api.post<{ status: string; message?: string; data: Staff }>('/staff', {
        businessId,
        ...form,
        linkUserEmail: form.linkUserEmail.trim() || undefined,
      });
      const data = res.data;
      setStaff((s) => [...s, data.data]);
      if (businessId) void loadStaffData(businessId);
      addToast('success', data.message || 'Personel eklendi.');
      setShowForm(false);
      setForm({
        name: '',
        title: '',
        phone: '',
        email: '',
        imageUrl: '',
        canViewOwnReservations: false,
        linkUserEmail: '',
      });
      dispatchBusinessSetupRefresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const startEdit = (s: Staff) => {
    setEditingId(s._id);
    const linkedEmail =
      typeof s.userId === 'object' && s.userId && 'email' in s.userId && s.userId.email
        ? String(s.userId.email)
        : '';
    setEditForm({
      name: s.name,
      title: s.title || '',
      phone: s.phone || '',
      email: s.email || '',
      imageUrl: s.imageUrl || '',
      canViewOwnReservations: s.canViewOwnReservations ?? false,
      linkUserEmail: linkedEmail,
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    setError('');
    try {
      const res = await api.put<{ status: string; message?: string; data: Staff }>(`/staff/${editingId}`, {
        ...editForm,
        linkUserEmail: editForm.linkUserEmail.trim(),
      });
      const updated = res.data.data;
      setStaff((list) => list.map((x) => (x._id === editingId ? updated : x)));
      addToast('success', res.data.message || 'Kaydedildi.');
      setEditingId(null);
      dispatchBusinessSetupRefresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  };

  const canAddStaff = quota?.canAddStaff !== false;
  const staffLimitLabel =
    quota?.staffLimit == null
      ? 'Sınırsız personel (Pro)'
      : `Personel: ${quota?.staffCount ?? staff.length} / ${quota.staffLimit}`;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Personel</h1>
          {quota && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{staffLimitLabel}</p>
          )}
        </div>
        <Button
          onClick={() => setShowForm(true)}
          disabled={!canAddStaff}
          title={
            canAddStaff
              ? undefined
              : 'Standart pakette en fazla 1 personel ekleyebilirsiniz. Pro pakete geçin.'
          }
        >
          Yeni Personel
        </Button>
      </div>
      {!canAddStaff && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">Personel limitine ulaştınız</p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
            Standart pakette yalnızca 1 personel tanımlayabilirsiniz. Sınırsız personel için Pro pakete geçin.
          </p>
          <Link
            href="/dashboard/business/subscription"
            className="mt-2 inline-block font-semibold text-primary-700 underline dark:text-primary-300"
          >
            Abonelik / paket yükseltme →
          </Link>
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-200">{error}</div>
      )}
      {showForm && businessId && (
        <Card>
          <h2 className="font-semibold text-neutral-900">Yeni personel ekle</h2>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100">
                {form.imageUrl ? (
                  <Image
                    src={form.imageUrl}
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="h-9 w-9 text-neutral-400" strokeWidth={1.25} aria-hidden />
                )}
              </div>
              <div>
                <input
                  ref={createFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCreatePhoto}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={createPhotoUploading}
                  disabled={createPhotoUploading}
                  onClick={() => createFileRef.current?.click()}
                >
                  Profil fotoğrafı
                </Button>
                <p className="mt-1 text-xs text-neutral-500">İsteğe bağlı. JPG, PNG veya WebP (max 5 MB).</p>
              </div>
            </div>
            <Input label="Ad Soyad" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <Input label="Ünvan" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Input
              label="Telefon"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+90 5xx xxx xx xx"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <Input
              label="E-posta (isteğe bağlı)"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <div className="rounded-2xl border border-primary-200/80 bg-gradient-to-b from-primary-50/60 to-white p-4 dark:border-primary-900/50 dark:from-primary-950/40 dark:to-neutral-950">
              <p className="text-sm font-semibold text-primary-900 dark:text-primary-200">
                Personel paneli yetkisi
              </p>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                İşletme panelinde siz tüm personeli ve randevuları her zaman yönetirsiniz. Aşağıdaki ayarlar yalnızca
                çalışanın kendi hesabında ne göreceği içindir.
              </p>
              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-white/80 bg-white/90 p-3 dark:border-neutral-700 dark:bg-neutral-900/80">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  checked={form.canViewOwnReservations}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, canViewOwnReservations: e.target.checked }))
                  }
                />
                <span className="text-sm text-neutral-800 dark:text-neutral-200">
                  <span className="font-semibold">Kendi randevularını görebilsin</span>
                  <span className="mt-1 block text-neutral-600 dark:text-neutral-400">
                    Açıksa çalışan, yalnızca kendisine atanmış randevuları müşteri panelinde görür (hesap eşleştirmesi gerekir).
                  </span>
                </span>
              </label>
              <div className="mt-4 border-t border-primary-200/70 pt-4 dark:border-primary-800/50">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Hesap eşleştirme (isteğe bağlı)
                </p>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  Çalışanın platformda kayıtlı giriş e-postası. Henüz kayıtlı değilse boş bırakın — personel yine eklenir;
                  kayıt olunca buradan tekrar kaydedersiniz. E-posta sistemde yoksa uyarı çıkar ama kayıt iptal olmaz.
                </p>
                <div className="mt-3">
                  <Input
                    label="Çalışan giriş e-postası"
                    type="email"
                    autoComplete="off"
                    placeholder="ornek@musteri.com"
                    value={form.linkUserEmail}
                    onChange={(e) => setForm((f) => ({ ...f, linkUserEmail: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Ekle</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setForm({
                    name: '',
                    title: '',
                    phone: '',
                    email: '',
                    imageUrl: '',
                    canViewOwnReservations: false,
                    linkUserEmail: '',
                  });
                }}
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card>
        {staff.length === 0 ? (
          <p className="text-neutral-500">Henüz personel yok.</p>
        ) : (
          <ul className="space-y-3">
            {staff.map((s) => (
              <li key={s._id} className="rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-700">
                      {s.imageUrl ? (
                        <Image
                          src={s.imageUrl}
                          alt=""
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                          {initials(s.name)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{s.name}</p>
                      {s.title && <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.title}</p>}
                    </div>
                  </div>
                  {editingId !== s._id && (
                    <Button type="button" variant="outline" size="sm" onClick={() => startEdit(s)}>
                      Düzenle
                    </Button>
                  )}
                </div>

                {editingId === s._id && (
                  <div className="mt-4 space-y-4 border-t border-neutral-200 pt-4 dark:border-neutral-600">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900">
                        {editForm.imageUrl ? (
                          <Image
                            src={editForm.imageUrl}
                            alt=""
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-neutral-400" strokeWidth={1.25} aria-hidden />
                        )}
                      </div>
                      <div>
                        <input
                          ref={editFileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleEditPhoto}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          loading={editPhotoUploading}
                          disabled={editPhotoUploading}
                          onClick={() => editFileRef.current?.click()}
                        >
                          Profil fotoğrafı değiştir
                        </Button>
                      </div>
                    </div>
                    <Input
                      label="Ad Soyad"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                    <Input label="Ünvan" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                    <Input
                      label="Telefon"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+90 5xx xxx xx xx"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                    <Input
                      label="E-posta (isteğe bağlı)"
                      type="email"
                      autoComplete="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    />
                    <div className="rounded-2xl border border-primary-200/80 bg-gradient-to-b from-primary-50/60 to-white p-4 dark:border-primary-900/50 dark:from-primary-950/40 dark:to-neutral-950">
                      <p className="text-sm font-semibold text-primary-900 dark:text-primary-200">
                        Personel paneli yetkisi
                      </p>
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                        İşletme olarak siz tam erişime sahipsiniz; burası çalışanın kendi hesabı içindir.
                      </p>
                      <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-white/80 bg-white/90 p-3 dark:border-neutral-700 dark:bg-neutral-900/80">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          checked={editForm.canViewOwnReservations}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, canViewOwnReservations: e.target.checked }))
                          }
                        />
                        <span className="text-sm text-neutral-800 dark:text-neutral-200">
                          <span className="font-semibold">Kendi randevularını görebilsin</span>
                          <span className="mt-1 block text-neutral-600 dark:text-neutral-400">
                            Kendisine atanmış randevuları müşteri panelinde listeler (hesap bağlıysa).
                          </span>
                        </span>
                      </label>
                      <div className="mt-4 border-t border-primary-200/70 pt-4 dark:border-primary-800/50">
                        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                          Hesap eşleştirme (isteğe bağlı)
                        </p>
                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                          Çalışanın giriş e-postası. Bulunamazsa önceki bağlantı korunur; diğer bilgiler yine kaydedilir.
                          Bağlantıyı kaldırmak için alanı silip kaydedin.
                        </p>
                        <div className="mt-3">
                          <Input
                            label="Çalışan giriş e-postası"
                            type="email"
                            autoComplete="off"
                            placeholder="Boş = bağlantıyı kaldır"
                            value={editForm.linkUserEmail}
                            onChange={(e) => setEditForm((f) => ({ ...f, linkUserEmail: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" loading={editSaving} onClick={() => void saveEdit()}>
                        Kaydet
                      </Button>
                      <Button type="button" variant="outline" disabled={editSaving} onClick={cancelEdit}>
                        İptal
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

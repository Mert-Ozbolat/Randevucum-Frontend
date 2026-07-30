'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { api, getApiErrorMessage } from '@/lib/api';
import { setAuth as persistAuth, type User as AuthUser } from '@/lib/auth';
import { isImageKitReady, uploadFileToImageKit } from '@/lib/imagekitUpload';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { phoneDigitsOnly, phoneInputFromStored } from '@/lib/phone';
import { useAuthStore } from '@/store/authStore';
import { useStaffPanel } from '@/contexts/StaffPanelContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const storeUser = useAuthStore((s) => s.user);
  const setStoreAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const { refreshStaffMe } = useStaffPanel();
  const { addToast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get<{ data: AuthUser }>('/auth/me');
        const u = res.data.data;
        if (cancelled || !u) return;
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setPhone(phoneInputFromStored(u.phone));
        setAvatarUrl(u.avatarUrl || '');
        setEmail(u.email || '');
      } catch {
        if (!cancelled && storeUser) {
          setFirstName(storeUser.firstName || '');
          setLastName(storeUser.lastName || '');
          setPhone(phoneInputFromStored(storeUser.phone));
          setAvatarUrl(storeUser.avatarUrl || '');
          setEmail(storeUser.email || '');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storeUser]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!isImageKitReady()) {
      addToast('error', 'ImageKit yapılandırması eksik.');
      return;
    }
    setPhotoUploading(true);
    try {
      const url = await uploadFileToImageKit(file, { folder: '/user-avatars' });
      setAvatarUrl(url);
      addToast('success', 'Fotoğraf yüklendi. Kaydet ile profilinize yazılır.');
    } catch (err) {
      addToast('error', getApiErrorMessage(err));
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) {
      setError('Ad ve soyad zorunludur.');
      return;
    }
    const digits = phoneDigitsOnly(phone);
    if (phone.trim() && digits.length < 10) {
      setError('Geçerli bir telefon numarası girin.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch<{ data: AuthUser }>('/auth/me', {
        firstName: fn,
        lastName: ln,
        phone: phone.trim() || '',
        avatarUrl: avatarUrl.trim(),
      });
      const updated = res.data.data;
      if (token && updated) {
        const merged: AuthUser = {
          _id: updated._id,
          email: updated.email,
          firstName: updated.firstName,
          lastName: updated.lastName,
          phone: updated.phone,
          avatarUrl: updated.avatarUrl,
          role: updated.role,
        };
        persistAuth(token, merged);
        setStoreAuth(token, merged);
      }
      setPhone(phoneInputFromStored(updated.phone));
      refreshStaffMe();
      addToast('success', 'Profil kaydedildi.');
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      addToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || '?';

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-1 py-2 sm:px-0">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Profil</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Ad, telefon ve profil fotoğrafınızı güncelleyin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hesap bilgileri</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
              Profil fotoğrafı
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profil"
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized={avatarUrl.startsWith('http')}
                  />
                ) : (
                  <span className="text-2xl font-bold text-neutral-400">{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
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
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={photoUploading}
                      onClick={() => setAvatarUrl('')}
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  JPG, PNG veya WebP. Kaydet ile profilinize yazılır.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Ad"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
            <Input
              label="Soyad"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>

          <Input
            label="E-posta"
            value={email}
            disabled
            className="opacity-80"
            title="E-posta değişikliği desteklenmiyor"
          />
          <p className="-mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            E-posta adresi güvenlik nedeniyle buradan değiştirilemez.
          </p>

          <PhoneInput label="Telefon" value={phone} onChange={setPhone} />

          <Button type="submit" loading={saving} disabled={saving || photoUploading} fullWidth>
            Kaydet
          </Button>
        </form>
      </Card>
    </div>
  );
}

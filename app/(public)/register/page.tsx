'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, getApiErrorMessage } from '@/lib/api';
import { setAuth } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { formatTrMobile, phoneDigitsOnly } from '@/lib/phone';

type AccountType = 'customer' | 'business_owner';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setStoreAuth = useAuthStore((s) => s.setAuth);
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [accountType, setAccountType] = useState<AccountType>('customer');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Allow deep-linking to business registration from pricing/upgrade flows.
    // Example: /register?type=business_owner&from=/pricing
    const type = searchParams.get('type');
    if (type === 'business_owner' || type === 'customer') {
      setAccountType(type);
      setStep('form');
    }
  }, [searchParams]);

  const handleSelectType = (type: AccountType) => {
    setAccountType(type);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (accountType === 'business_owner' && phoneDigitsOnly(phone).length < 10) {
      setError('İşletme hesabı için telefon numarası zorunludur.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<{
        data: { user: { _id: string; email: string; firstName: string; lastName: string; role: string }; token: string };
      }>('/auth/register', {
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        role: accountType,
      });
      const { user, token } = data.data;
      setAuth(token, {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as 'customer' | 'business_owner' | 'super_admin',
      });
      setStoreAuth(token, {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as 'customer' | 'business_owner' | 'super_admin',
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (idToken: string) => {
    setError('');
    if (accountType === 'business_owner') {
      const digits = phoneDigitsOnly(phone);
      if (digits.length < 10) {
        setError('İşletme hesabı için telefon numarasını girin (aşağıdaki alan).');
        return;
      }
    }
    setGoogleLoading(true);
    try {
      const { data } = await api.post<{
        data: { user: { _id: string; email: string; firstName: string; lastName: string; role: string }; token: string };
      }>('/auth/google', {
        idToken,
        accountType,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      const { user, token } = data.data;
      setAuth(token, {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as 'customer' | 'business_owner' | 'super_admin',
      });
      setStoreAuth(token, {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as 'customer' | 'business_owner' | 'super_admin',
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  if (step === 'type') {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col justify-center px-4 py-12">
        <Card>
          <h1 className="text-2xl font-semibold text-neutral-900">Hesap Türü Seçin</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Randevu almak mı yoksa işletmenizi yönetmek mi istiyorsunuz?
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSelectType('customer')}
              className="flex flex-col rounded-xl border-2 border-neutral-200 bg-white p-6 text-left shadow-card transition hover:border-primary-400 hover:bg-primary-50/30"
            >
              <span className="text-lg font-semibold text-neutral-900">Bireysel</span>
              <span className="mt-1 text-sm text-neutral-600">
                Randevu almak, işletmeleri keşfetmek ve randevularımı yönetmek için.
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectType('business_owner')}
              className="flex flex-col rounded-xl border-2 border-neutral-200 bg-white p-6 text-left shadow-card transition hover:border-primary-400 hover:bg-primary-50/30"
            >
              <span className="text-lg font-semibold text-neutral-900">İşletme</span>
              <span className="mt-1 text-sm text-neutral-600">
                Salon, klinik veya restoranınız için randevu ve abonelik yönetimi.
              </span>
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-neutral-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:underline">
              Giriş yapın
            </Link>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
          <button type="button" onClick={() => setStep('type')} className="hover:text-primary-600">
            ← Hesap türü
          </button>
          <span>•</span>
          <span>
            {accountType === 'customer' ? 'Bireysel' : 'İşletme'} kaydı
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900">Kayıt Ol</h1>
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}
        {accountType === 'business_owner' && (
          <div className="mt-4">
            <Input
              label="Telefon"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              placeholder="0 5xx xxx xx xx"
              value={phone}
              onChange={(e) => {
                const digits = phoneDigitsOnly(e.target.value);
                if (digits.length <= 11) setPhone(formatTrMobile(digits));
              }}
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              İşletme hesabı için zorunludur (Google veya e-posta ile kayıt).
            </p>
          </div>
        )}
        <div className="mt-6">
          <GoogleSignInButton
            text="signup_with"
            onCredential={handleGoogleCredential}
            onError={() => setError('Google ile kayıt başarısız.')}
          />
          {googleLoading && (
            <p className="mt-2 text-center text-sm text-neutral-500">Google ile kayıt tamamlanıyor…</p>
          )}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-900">veya e-posta ile</span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <Input
            label="Ad"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Soyad"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <Input
            label="E-posta"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Şifre"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {accountType === 'customer' && (
            <Input
              label="Telefon (isteğe bağlı)"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0 5xx xxx xx xx"
              value={phone}
              onChange={(e) => {
                const digits = phoneDigitsOnly(e.target.value);
                if (digits.length <= 11) setPhone(formatTrMobile(digits));
              }}
            />
          )}
          <Button type="submit" fullWidth loading={loading}>
            Kayıt Ol
          </Button>
        </form>
      </Card>
    </div>
  );
}

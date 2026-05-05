'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { api, getApiErrorMessage } from '@/lib/api';
import { setAuth } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

type AccountType = 'customer' | 'business_owner';

type AuthPayload = {
  data: {
    user: { _id: string; email: string; firstName: string; lastName: string; role: string };
    token: string;
  };
};

type GoogleAccountRequired = {
  status?: string;
  code?: string;
  message?: string;
  data?: { email: string; firstName: string; lastName: string };
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';
  const debug = searchParams.get('debug') === '1';
  const setStoreAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);
  const [googleProfile, setGoogleProfile] = useState<{ firstName: string; lastName: string }>({
    firstName: '',
    lastName: '',
  });
  const [googleAccountType, setGoogleAccountType] = useState<AccountType | null>(null);

  useEffect(() => {
    if (!debug) return;
    // Safe env debug: only NEXT_PUBLIC values, never secrets.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    // eslint-disable-next-line no-console
    console.log('[env-debug] NEXT_PUBLIC_API_URL:', apiUrl || '(missing)');
    // eslint-disable-next-line no-console
    console.log('[env-debug] NEXT_PUBLIC_GOOGLE_CLIENT_ID set?:', Boolean(googleClientId));
    // eslint-disable-next-line no-console
    console.log('[env-debug] NEXT_PUBLIC_GOOGLE_CLIENT_ID prefix:', googleClientId ? googleClientId.slice(0, 10) + '...' : '(missing)');
  }, [debug]);

  const finishAuth = (data: AuthPayload['data']) => {
    const u = {
      _id: data.user._id,
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      role: data.user.role as 'customer' | 'business_owner' | 'super_admin',
    };
    setAuth(data.token, u);
    setStoreAuth(data.token, u);
    router.push(from);
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<AuthPayload>('/auth/login', {
        email,
        password,
      });
      finishAuth(data.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const sendGoogleAuth = async (
    idToken: string,
    extras?: { accountType?: AccountType; firstName?: string; lastName?: string }
  ) => {
    setGoogleLoading(true);
    setError('');
    try {
      const { data } = await api.post<AuthPayload>('/auth/google', {
        idToken,
        accountType: extras?.accountType,
        firstName: extras?.firstName,
        lastName: extras?.lastName,
      });
      setPendingGoogleToken(null);
      setGoogleAccountType(null);
      finishAuth(data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as GoogleAccountRequired;
        if (body?.code === 'ACCOUNT_TYPE_REQUIRED') {
          setPendingGoogleToken(idToken);
          setGoogleProfile({
            firstName: body.data?.firstName || '',
            lastName: body.data?.lastName || '',
          });
          return;
        }
      }
      setError(getApiErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleCredential = (credential: string) => {
    void sendGoogleAuth(credential);
  };

  const completeGoogleRegistration = () => {
    if (!pendingGoogleToken || !googleAccountType) return;
    void sendGoogleAuth(pendingGoogleToken, {
      accountType: googleAccountType,
      firstName: googleProfile.firstName.trim() || undefined,
      lastName: googleProfile.lastName.trim() || undefined,
    });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <h1 className="text-2xl font-semibold text-neutral-900">Giriş Yap</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Hesabınıza giriş yaparak randevu ve panel işlemlerinize devam edin.
        </p>
        {debug && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-semibold">Env debug (public)</p>
            <p className="mt-1">
              <span className="font-medium">NEXT_PUBLIC_API_URL:</span>{' '}
              <code className="rounded bg-white/70 px-1 dark:bg-neutral-900/60">
                {process.env.NEXT_PUBLIC_API_URL || '(missing)'}
              </code>
            </p>
            <p className="mt-1">
              <span className="font-medium">NEXT_PUBLIC_GOOGLE_CLIENT_ID:</span>{' '}
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'set' : '(missing)'}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && !pendingGoogleToken && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth loading={loading}>
            Giriş Yap
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-900">veya</span>
          </div>
        </div>
        <GoogleSignInButton
          text="signin_with"
          onCredential={handleGoogleCredential}
          onError={() => setError('Google ile giriş başarısız.')}
        />
        {googleLoading && (
          <p className="mt-2 text-center text-sm text-neutral-500">Google ile bağlanılıyor…</p>
        )}

        <p className="mt-4 text-center text-sm text-neutral-600">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="font-medium text-primary-600 hover:underline">
            Kayıt olun
          </Link>
        </p>
      </Card>

      {pendingGoogleToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Hesap türü</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Bu e-posta ile ilk kez giriş yapıyorsunuz. Randevu almak mı yoksa işletme hesabı mı
              oluşturmak istiyorsunuz?
            </p>
            {error && <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setGoogleAccountType('customer')}
                className={`rounded-xl border-2 p-4 text-left text-sm transition ${
                  googleAccountType === 'customer'
                    ? 'border-primary-500 bg-primary-50/50'
                    : 'border-neutral-200 hover:border-primary-300'
                }`}
              >
                <span className="font-semibold text-neutral-900">Bireysel</span>
                <span className="mt-1 block text-neutral-600">Randevu almak ve rezervasyonlarımı yönetmek.</span>
              </button>
              <button
                type="button"
                onClick={() => setGoogleAccountType('business_owner')}
                className={`rounded-xl border-2 p-4 text-left text-sm transition ${
                  googleAccountType === 'business_owner'
                    ? 'border-primary-500 bg-primary-50/50'
                    : 'border-neutral-200 hover:border-primary-300'
                }`}
              >
                <span className="font-semibold text-neutral-900">İşletme</span>
                <span className="mt-1 block text-neutral-600">İşletme paneli ve abonelik.</span>
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <Input
                label="Ad (isteğe bağlı)"
                value={googleProfile.firstName}
                onChange={(e) => setGoogleProfile((p) => ({ ...p, firstName: e.target.value }))}
              />
              <Input
                label="Soyad (isteğe bağlı)"
                value={googleProfile.lastName}
                onChange={(e) => setGoogleProfile((p) => ({ ...p, lastName: e.target.value }))}
              />
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                fullWidth
                className="sm:flex-1"
                loading={googleLoading}
                disabled={!googleAccountType}
                onClick={completeGoogleRegistration}
              >
                Devam et
              </Button>
              <Button
                variant="outline"
                fullWidth
                className="sm:flex-1"
                disabled={googleLoading}
                onClick={() => {
                  setPendingGoogleToken(null);
                  setGoogleAccountType(null);
                  setError('');
                }}
              >
                İptal
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

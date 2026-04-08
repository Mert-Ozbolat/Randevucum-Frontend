'use client';

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

type Props = {
  onCredential: (credential: string) => void;
  onError?: () => void;
  /** Maps to Google button label when OAuth is configured */
  text?: 'signin_with' | 'signup_with' | 'continue_with';
};

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? '';
const isGoogleConfigured = clientId.length > 0;

function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GoogleSignInButton({ onCredential, onError, text = 'continue_with' }: Props) {
  const labelTr =
    text === 'signup_with'
      ? 'Google ile kayıt ol'
      : text === 'signin_with'
        ? 'Google ile giriş yap'
        : 'Google ile devam et';

  if (!isGoogleConfigured) {
    return (
      <div className="w-full space-y-2">
        <div
          className="flex w-full min-h-[44px] items-center justify-center gap-3 rounded-lg border-2 border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400"
          role="status"
        >
          <GoogleGIcon className="shrink-0 opacity-60" />
          <span>{labelTr}</span>
          <span className="sr-only">— yapılandırma gerekli</span>
        </div>
        <p className="text-center text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          Aktif olması için{' '}
          <code className="rounded bg-neutral-200/80 px-1.5 py-0.5 font-mono text-[11px] text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200">
            NEXT_PUBLIC_GOOGLE_CLIENT_ID
          </code>{' '}
          değerini <code className="font-mono text-[11px]">frontend/.env.local</code> dosyasına ekleyin.
          API tarafında da <code className="font-mono text-[11px]">GOOGLE_CLIENT_ID</code> aynı olmalı. Değişiklikten sonra{' '}
          <code className="font-mono text-[11px]">npm run dev</code> yeniden başlatın.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[44px] w-full justify-center [&>div]:!w-full [&>div]:max-w-none">
      <GoogleLogin
        onSuccess={(cred: CredentialResponse) => {
          if (cred.credential) onCredential(cred.credential);
        }}
        onError={() => onError?.()}
        useOneTap={false}
        text={text}
        shape="rectangular"
        theme="outline"
        size="large"
      />
    </div>
  );
}

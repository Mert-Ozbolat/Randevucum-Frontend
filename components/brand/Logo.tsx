'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sora } from 'next/font/google';

const brandFont = Sora({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

type LogoSize = 'sm' | 'md';
type LogoVariant = 'default' | 'wordmark';

interface LogoProps {
  size?: LogoSize;
  /** Ana sayfada yalnızca yazı; diğer sayfalarda ikon + yazı */
  variant?: LogoVariant;
  /** Ana sayfaya giden link; `false` ise sadece marka (ör. footer) */
  href?: string | false;
  className?: string;
}

function LogoMark({ className }: { className: string }) {
  return (
    <Image
      src="/icon1.png"
      alt=""
      width={56}
      height={56}
      className={`${className} shrink-0 rounded-[12px] object-contain shadow-glow ring-1 ring-black/5 dark:ring-white/10`}
      sizes="56px"
      priority
    />
  );
}

function LogoWordmark({ size }: { size: LogoSize }) {
  const textClass =
    size === 'sm'
      ? 'text-[1.75rem] leading-none sm:text-[2.125rem] tracking-[-0.04em]'
      : 'text-[2rem] leading-none sm:text-[2.375rem] tracking-[-0.045em]';

  return (
    <span
      className={`${brandFont.className} ${textClass} font-bold text-primary-700 dark:text-primary-300`}
    >
      Randevucum
    </span>
  );
}

export function Logo({ size = 'md', variant = 'default', href = '/', className = '' }: LogoProps) {
  const iconClass =
    size === 'sm' ? 'h-11 w-11 sm:h-12 sm:w-12' : 'h-12 w-12 sm:h-14 sm:w-14';
  const textClass =
    size === 'sm'
      ? `${brandFont.className} text-lg sm:text-xl font-semibold tracking-[-0.02em]`
      : `${brandFont.className} text-xl sm:text-2xl font-semibold tracking-[-0.025em]`;

  const inner =
    variant === 'wordmark' ? (
      <span className={`inline-flex items-center ${className}`}>
        <LogoWordmark size={size} />
      </span>
    ) : (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        <LogoMark className={iconClass} />
        <span className={`text-primary-700 dark:text-primary-300 ${textClass}`}>Randevucum</span>
      </span>
    );

  if (href === false) {
    return inner;
  }

  return (
    <Link href={href} className="rounded-xl outline-none ring-primary-500/0 transition hover:opacity-95 focus-visible:ring-2">
      {inner}
    </Link>
  );
}

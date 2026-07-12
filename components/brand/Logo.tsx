'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const brandFont = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['700', '800'],
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
      width={40}
      height={40}
      className={`${className} shrink-0 rounded-[10px] object-contain shadow-glow`}
      sizes="40px"
      priority
    />
  );
}

function LogoWordmark({ size }: { size: LogoSize }) {
  const textClass =
    size === 'sm'
      ? 'text-xl sm:text-2xl tracking-[-0.03em]'
      : 'text-2xl sm:text-[1.85rem] tracking-[-0.035em]';

  return (
    <span
      className={`${brandFont.className} ${textClass} bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 bg-clip-text font-extrabold text-transparent dark:from-primary-300 dark:via-primary-400 dark:to-primary-500`}
    >
      Randevucum
    </span>
  );
}

export function Logo({ size = 'md', variant = 'default', href = '/', className = '' }: LogoProps) {
  const iconClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const textClass =
    size === 'sm'
      ? 'text-base tracking-tight'
      : 'text-lg sm:text-xl tracking-tight';

  const inner =
    variant === 'wordmark' ? (
      <span className={`inline-flex items-center ${className}`}>
        <LogoWordmark size={size} />
      </span>
    ) : (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <LogoMark className={iconClass} />
        <span className={`font-bold text-primary-700 dark:text-primary-400 ${textClass}`}>
          Randevucum
        </span>
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

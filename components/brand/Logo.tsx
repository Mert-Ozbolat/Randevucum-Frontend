'use client';

import { Link } from '@/i18n/navigation';
import { REM } from 'next/font/google';

const brandFont = REM({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

type LogoSize = 'sm' | 'md';

interface LogoProps {
  size?: LogoSize;
  href?: string | false;
  className?: string;
}

export function Logo({ size = 'md', href = '/', className = '' }: LogoProps) {
  const textClass =
    size === 'sm'
      ? `${brandFont.className} text-base sm:text-lg font-normal uppercase tracking-[0.04em]`
      : `${brandFont.className} text-lg sm:text-xl font-normal uppercase tracking-[0.05em]`;

  const inner = (
    <span className={`inline-flex items-center ${className}`}>
      <span className={`text-primary-700 dark:text-primary-300 ${textClass}`}>Randevucum</span>
    </span>
  );

  if (href === false) return inner;

  return (
    <Link
      href={href}
      className="rounded-xl outline-none ring-primary-500/0 transition hover:opacity-95 focus-visible:ring-2"
    >
      {inner}
    </Link>
  );
}

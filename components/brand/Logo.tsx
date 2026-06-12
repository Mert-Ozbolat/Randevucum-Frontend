'use client';

import Image from 'next/image';
import Link from 'next/link';

type LogoSize = 'sm' | 'md';

interface LogoProps {
  size?: LogoSize;
  /** Ana sayfaya giden link; `false` ise sadece marka (ör. footer) */
  href?: string | false;
  className?: string;
}

function LogoMark({ className }: { className: string }) {
  return (
    <Image
      src="/logo-randevu.jpeg"
      alt=""
      width={40}
      height={40}
      className={`${className} shrink-0 rounded-[10px] object-contain shadow-glow`}
      sizes="40px"
      priority
    />
  );
}

export function Logo({ size = 'md', href = '/', className = '' }: LogoProps) {
  const iconClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const textClass =
    size === 'sm'
      ? 'text-base tracking-tight'
      : 'text-lg sm:text-xl tracking-tight';

  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={iconClass} />
      <span className={`font-bold ${textClass}`}>
        <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-200">
          Randevu
        </span>
        <span className="text-neutral-800 dark:text-neutral-100">cum</span>
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

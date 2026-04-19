'use client';

import Link from 'next/link';
import { useId } from 'react';

type LogoSize = 'sm' | 'md';

interface LogoProps {
  size?: LogoSize;
  /** Ana sayfaya giden link; `false` ise sadece marka (ör. footer) */
  href?: string | false;
  className?: string;
}

function LogoMark({ className, gradientId }: { className?: string; gradientId: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="6" y1="4" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ade80" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill={`url(#${gradientId})`} />
      <path
        d="M12 14h16a2 2 0 012 2v12a2 2 0 01-2 2H12a2 2 0 01-2-2V16a2 2 0 012-2z"
        stroke="white"
        strokeOpacity="0.92"
        strokeWidth="1.5"
      />
      <path d="M12 19h16" stroke="white" strokeOpacity="0.85" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M16 11v4M24 11v4" stroke="white" strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="26" cy="26" r="5" fill="white" fillOpacity="0.95" />
      <path
        d="M24 26l1.8 1.8 3.5-4.2"
        stroke="#15803d"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ size = 'md', href = '/', className = '' }: LogoProps) {
  const rawId = useId().replace(/:/g, '');
  const gradientId = `randevucum-grad-${rawId}`;
  const iconClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const textClass =
    size === 'sm'
      ? 'text-base tracking-tight'
      : 'text-lg sm:text-xl tracking-tight';

  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`${iconClass} shrink-0 shadow-glow`} gradientId={gradientId} />
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

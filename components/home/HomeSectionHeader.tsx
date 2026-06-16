import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HomeSectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
}

export function HomeSectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'Tümünü gör',
  align = 'left',
}: HomeSectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div
      className={`flex flex-col gap-4 ${
        centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      }`}
    >
      <div className={centered ? 'max-w-2xl' : ''}>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            {eyebrow}
          </p>
        )}
        <h2
          className={`font-bold tracking-tight text-neutral-900 dark:text-neutral-50 ${
            eyebrow ? 'mt-2' : ''
          } text-2xl sm:text-3xl lg:text-[2rem]`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-2 text-neutral-600 dark:text-neutral-400 ${centered ? 'mx-auto' : 'max-w-xl'}`}>
            {description}
          </p>
        )}
      </div>
      {href && !centered && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-primary-300 dark:hover:border-primary-600"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </Link>
      )}
    </div>
  );
}

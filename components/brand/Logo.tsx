"use client";

import Image from "next/image";
import Link from "next/link";
import { REM } from "next/font/google";

const brandFont = REM({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

type LogoSize = "sm" | "md";
type LogoVariant = "default" | "wordmark";

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
      width={44}
      height={44}
      className={`${className} shrink-0 rounded-[10px] object-contain shadow-glow ring-1 ring-black/5 dark:ring-white/10`}
      sizes="44px"
      priority
    />
  );
}

function LogoWordmark({ size }: { size: LogoSize }) {
  const textClass =
    size === "sm" ? "text-lg sm:text-xl" : "text-xl sm:text-[1.25rem]";

  return (
    <span
      className={`${brandFont.className} ${textClass} font-normal uppercase text-primary-700 dark:text-primary-300`}
    >
      Randevucum
    </span>
  );
}

export function Logo({
  size = "md",
  variant = "default",
  href = "/",
  className = "",
}: LogoProps) {
  const iconClass =
    size === "sm" ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-11 sm:w-11";
  const textClass =
    size === "sm"
      ? `${brandFont.className} text-base sm:text-lg font-normal uppercase`
      : `${brandFont.className} text-lg sm:text-xl font-normal uppercase`;

  const inner =
    variant === "wordmark" ? (
      <span className={`inline-flex items-center ${className}`}>
        <LogoWordmark size={size} />
      </span>
    ) : (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <LogoMark className={iconClass} />
        <span
          className={`uppercase text-primary-700 dark:text-primary-300 ${textClass}`}
        >
          Randevucum
        </span>
      </span>
    );

  if (href === false) {
    return inner;
  }

  return (
    <Link
      href={href}
      className="rounded-xl outline-none ring-primary-500/0 transition hover:opacity-95 focus-visible:ring-2"
    >
      {inner}
    </Link>
  );
}

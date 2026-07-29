import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HomeSectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  /** default: text-2xl/3xl · large: text-2xl → 5xl */
  titleSize?: "default" | "large";
  titleId?: string;
}

export function HomeSectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Tümünü gör",
  align = "left",
  titleSize = "default",
  titleId,
}: HomeSectionHeaderProps) {
  const centered = align === "center";
  const titleClasses =
    titleSize === "large"
      ? "text-2xl sm:text-4xl lg:text-5xl"
      : "text-xl sm:text-2xl md:text-3xl";

  return (
    <div
      className={`flex min-w-0 flex-col gap-3 sm:gap-4 ${
        centered
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div
        className={`min-w-0 ${
          centered && titleSize === "large" ? "max-w-3xl" : "max-w-2xl"
        } ${centered ? "w-full" : ""}`}
      >
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-600 sm:text-xs sm:tracking-[0.18em] dark:text-primary-400">
            {eyebrow}
          </p>
        )}
        <h2
          id={titleId}
          className={`text-balance break-words font-bold tracking-tight text-neutral-900 dark:text-neutral-50 ${
            eyebrow ? "mt-2" : ""
          } ${titleClasses}`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400 ${
              centered ? "mx-auto max-w-xl" : ""
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {href && !centered && (
        <Link
          href={href}
          className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-primary-300 dark:hover:border-primary-600"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </Link>
      )}
    </div>
  );
}

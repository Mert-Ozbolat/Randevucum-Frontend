'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, FileText, Mail } from 'lucide-react';
import { LEGAL, LEGAL_LINKS } from '@/lib/legal/constants';
import type { LegalBlock, LegalPageContent } from '@/lib/legal/types';

function LegalBlockView({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'p':
      return <p className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">{block.text}</p>;
    case 'ul':
      return (
        <ul className="ml-1 space-y-2">
          {block.items.map((item) => (
            <li
              key={item.slice(0, 40)}
              className="flex gap-2.5 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {block.items.map((item) => (
            <li key={item.slice(0, 40)}>{item}</li>
          ))}
        </ol>
      );
    case 'note':
      return (
        <div className="rounded-xl border border-primary-200/80 bg-primary-50/60 px-4 py-3.5 dark:border-primary-800/50 dark:bg-primary-950/30">
          {block.title && (
            <p className="text-sm font-semibold text-primary-900 dark:text-primary-200">{block.title}</p>
          )}
          <p className={`text-sm leading-relaxed text-primary-800 dark:text-primary-300 ${block.title ? 'mt-1' : ''}`}>
            {block.text}
          </p>
        </div>
      );
    case 'table':
      return (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/80">
                <th className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">{block.headers[0]}</th>
                <th className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">{block.headers[1]}</th>
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr
                  key={row[0]}
                  className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                >
                  <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-200">{row[0]}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export function LegalPageLayout({ content }: { content: LegalPageContent }) {
  const [activeId, setActiveId] = useState(content.sections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] }
    );
    content.sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [content.sections]);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950">
      {/* Hero */}
      <div className="border-b border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-950/50">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                Yasal bilgilendirme
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                {content.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                {content.subtitle}
              </p>
              <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-500">
                Son güncelleme: {LEGAL.lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* İçindekiler */}
          <aside className="lg:w-64 lg:shrink-0">
            <nav
              className="sticky top-24 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
              aria-label="İçindekiler"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">İçindekiler</p>
              <ul className="space-y-1">
                {content.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm transition ${
                        activeId === section.id
                          ? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">Diğer sayfalar</p>
                <ul className="space-y-1">
                  {LEGAL_LINKS.filter((l) => l.href !== `/${content.slug}`).map(
                    (link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block rounded-lg px-2 py-1.5 text-xs text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </nav>
          </aside>

          {/* İçerik */}
          <div className="min-w-0 flex-1 space-y-8">
            {content.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:p-8"
              >
                <div className="mb-5 flex items-baseline gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-sm font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{section.title}</h2>
                    {section.summary && (
                      <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{section.summary}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">{section.blocks.map((block, i) => <LegalBlockView key={i} block={block} />)}</div>
              </section>
            ))}

            {/* İletişim CTA */}
            <div className="rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white p-6 dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-900/50 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">Sorularınız mı var?</p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Yasal konularda bize ulaşın — en kısa sürede yanıt veririz.
                  </p>
                </div>
                <a
                  href={`mailto:${LEGAL.supportEmail}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  {LEGAL.supportEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

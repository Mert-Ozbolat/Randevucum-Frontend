'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { buildSetupStepsFromApi, type BusinessSetupStepsMap } from '@/lib/businessSetup';
import { BUSINESS_SETUP_REFRESH_EVENT } from '@/lib/businessSetupRefresh';

export function BusinessSetupStatusBar() {
  const pathname = usePathname();
  const silentRefreshRef = useRef(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [noBusiness, setNoBusiness] = useState(false);
  const [percent, setPercent] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(4);
  const [steps, setSteps] = useState<ReturnType<typeof buildSetupStepsFromApi>['steps']>([]);
  const [isPublicActive, setIsPublicActive] = useState(false);

  useEffect(() => {
    const onRefresh = () => {
      silentRefreshRef.current = true;
      setRefreshTick((n) => n + 1);
    };
    window.addEventListener(BUSINESS_SETUP_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(BUSINESS_SETUP_REFRESH_EVENT, onRefresh);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const silent = silentRefreshRef.current;
    silentRefreshRef.current = false;
    if (!silent) setLoading(true);

    api
      .get<{
        data: {
          hasBusiness: boolean;
          isActive: boolean;
          setupComplete: boolean;
          percent: number;
          completed: number;
          total: number;
          steps?: BusinessSetupStepsMap;
        };
      }>('/business/setup-status')
      .then((res) => {
        if (cancelled) return;
        const status = res.data.data;
        if (!status?.hasBusiness) {
          setNoBusiness(true);
          setSteps([]);
          setPercent(0);
          setCompleted(0);
          setIsPublicActive(false);
          return;
        }
        setNoBusiness(false);
        setIsPublicActive(Boolean(status.isActive));

        if (status.steps) {
          const result = buildSetupStepsFromApi(status.steps);
          setSteps(result.steps);
          setPercent(result.percent);
          setCompleted(result.completed);
          setTotal(result.total);
        } else {
          setPercent(status.percent ?? 0);
          setCompleted(status.completed ?? 0);
          setTotal(status.total ?? 4);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSteps([]);
          setPercent(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, refreshTick]);

  if (loading) {
    return (
      <div className="border-b border-neutral-200 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>Kurulum durumu yükleniyor…</span>
        </div>
      </div>
    );
  }

  if (noBusiness) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/40 sm:px-6">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          <span className="font-semibold">İşletme henüz yok.</span>{' '}
          <Link href="/dashboard/business/info" className="font-medium underline underline-offset-2 hover:no-underline">
            İşletme oluşturarak başlayın →
          </Link>
        </p>
      </div>
    );
  }

  const allDone = completed === total && total > 0;
  const published = isPublicActive && allDone;

  return (
    <div
      className={`border-b px-4 py-3 sm:px-6 ${
        published
          ? 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/40 dark:bg-emerald-950/30'
          : 'border-amber-200 bg-amber-50/95 dark:border-amber-900/50 dark:bg-amber-950/40'
      }`}
    >
      {!published && (
        <p className="mb-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
          İşletmeniz müşterilere henüz görünmüyor — kurulumu tamamlayana kadar randevu alınamaz.
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              {published ? 'İşletme yayında' : 'Hesap kurulumu gerekli'}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                allDone
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                  : 'bg-primary-600 text-white dark:bg-primary-500'
              }`}
            >
              %{percent}
            </span>
            {published ? (
              <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                Müşterilere açık
              </span>
            ) : (
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {completed}/{total} adım
              </span>
            )}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                published ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Kurulum tamamlanma yüzdesi: ${percent}`}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              Özeti gizle <ChevronUp className="h-4 w-4" aria-hidden />
            </>
          ) : (
            <>
              Adımları göster <ChevronDown className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.id}>
              <Link
                href={s.href}
                className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                  s.done
                    ? 'border-emerald-200 bg-white/80 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-neutral-900/50 dark:hover:bg-emerald-950/40'
                    : 'border-neutral-200 bg-white/90 hover:border-primary-300 hover:bg-primary-50/50 dark:border-neutral-600 dark:bg-neutral-900/70 dark:hover:border-primary-700'
                }`}
              >
                {s.done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-500" aria-hidden />
                )}
                <span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{s.shortLabel}</span>
                  <span className="mt-0.5 block text-xs text-neutral-600 dark:text-neutral-400">{s.label}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!expanded && !published && (
        <p className="mt-2 text-xs text-amber-900/90 dark:text-amber-100/90">
          Profil (telefon, konum, açıklama), en az 1 hizmet, en az 1 personel ve çalışma saatleri tamamlanınca işletme
          otomatik yayına alınır.{' '}
          <Link href="/dashboard/business/info" className="font-semibold underline underline-offset-2">
            İşletme bilgisi →
          </Link>
        </p>
      )}
    </div>
  );
}

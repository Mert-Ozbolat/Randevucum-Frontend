'use client';

import { useEffect, useState } from 'react';
import { Activity, Flame, Store } from 'lucide-react';
import { fetchHomeStats, pingPresence, type HomeStatsPayload } from '@/lib/homeStats';

const POLL_MS = 25_000;
const PING_MS = 40_000;

export function HomeLiveStats() {
  const [stats, setStats] = useState<HomeStatsPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchHomeStats().then((s) => {
        if (!cancelled && s) setStats(s);
      });
    };

    (async () => {
      await pingPresence().catch(() => {});
      const s = await fetchHomeStats();
      if (!cancelled && s) setStats(s);
    })();

    const tPoll = window.setInterval(load, POLL_MS);
    const tPing = window.setInterval(() => pingPresence().catch(() => {}), PING_MS);

    return () => {
      cancelled = true;
      window.clearInterval(tPoll);
      window.clearInterval(tPing);
    };
  }, []);

  const a = stats?.activeUsers ?? '—';
  const r = stats?.todayReservations ?? '—';
  const b = stats?.registeredBusinesses ?? '—';
  const windowMin = stats?.activeWindowMinutes ?? 5;

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-card dark:border-neutral-600/80 dark:bg-neutral-800/80">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
          aria-hidden
        >
          <Activity className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50">{a}</p>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Aktif kullanıcı <span className="text-neutral-400 dark:text-neutral-500">({windowMin} dk)</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-card dark:border-neutral-600/80 dark:bg-neutral-800/80">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"
          aria-hidden
        >
          <Flame className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50">{r}</p>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Bugünkü randevu</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-card dark:border-neutral-600/80 dark:bg-neutral-800/80">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
          aria-hidden
        >
          <Store className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50">{b}</p>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Kayıtlı işletme</p>
        </div>
      </div>
    </div>
  );
}

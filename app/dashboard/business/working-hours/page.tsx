'use client';

import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { useToast } from '@/components/ui/Toast';
import { dispatchBusinessSetupRefresh } from '@/lib/businessSetupRefresh';

interface WorkingHour {
  dayOfWeek: number;
  open: string;
  close: string;
  isClosed: boolean;
}

interface BreakTime {
  start: string;
  end: string;
  dayOfWeek?: number | null;
}

const DAYS = [0, 1, 2, 3, 4, 5, 6];

export default function WorkingHoursPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [hours, setHours] = useState<WorkingHour[]>([]);
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    api
      fetchMyBusinesses<{ data: { _id: string; workingHours?: WorkingHour[]; breakTimes?: BreakTime[] }[] }>()
      .then((res) => {
        const list = res.data.data || [];
        const b = list[0];
        if (b) {
          setBusinessId(b._id);
          const wh: WorkingHour[] =
            b.workingHours && b.workingHours.length > 0
              ? b.workingHours
              : DAYS.map((d) => ({ dayOfWeek: d, open: '09:00', close: '18:00', isClosed: d === 0 }));
          setHours(wh);
          setBreakTimes(b.breakTimes?.length ? b.breakTimes : [{ start: '12:00', end: '13:00' }]);
        }
      })
      .catch(() => setError('Yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const updateDay = (dayOfWeek: number, field: keyof WorkingHour, value: string | boolean) => {
    setHours((prev) => {
      const next = prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h));
      const has = next.some((h) => h.dayOfWeek === dayOfWeek);
      if (!has) next.push({ dayOfWeek, open: '09:00', close: '18:00', isClosed: false, [field]: value } as WorkingHour);
      return next.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    });
  };

  const getDay = (dayOfWeek: number): WorkingHour => {
    return hours.find((h) => h.dayOfWeek === dayOfWeek) ?? { dayOfWeek, open: '09:00', close: '18:00', isClosed: false };
  };

  const updateBreakTime = (index: number, field: keyof BreakTime, value: string | number | null) => {
    setBreakTimes((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { start: '12:00', end: '13:00' };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addBreakTime = () => {
    setBreakTimes((prev) => [...prev, { start: '12:00', end: '13:00' }]);
  };

  const removeBreakTime = (index: number) => {
    setBreakTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setError('');
    setSaving(true);
    try {
      await api.put(`/business/${businessId}`, {
        workingHours: hours,
        breakTimes,
        workingHoursConfigured: true,
      });
      addToast('success', 'Çalışma saatleri kaydedildi.');
      dispatchBusinessSetupRefresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Çalışma Saatleri</h1>
        <Card className="p-8 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            Henüz işletme eklenmemiş. Önce bir işletme oluşturun.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Çalışma Saatleri</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Çalışma saatleri ve mola/engelleme zamanlarınız randevu müsaitliklerini belirler.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <Card className="p-6">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Haftalık çalışma saatleri</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Her gün için açılış/kapanış saatini girin veya &quot;Kapalı&quot; işaretleyin.
          </p>
          <div className="mt-4 space-y-4">
            {DAYS.map((d) => {
              const h = getDay(d);
              return (
                <div
                  key={d}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-600 dark:bg-neutral-800/50"
                >
                  <div className="w-28 font-medium text-neutral-700 dark:text-neutral-200">
                    {DAYS_OF_WEEK[d] ?? `Gün ${d}`}
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!h.isClosed}
                      onChange={(e) => updateDay(d, 'isClosed', e.target.checked)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-500 dark:bg-neutral-900"
                    />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">Kapalı</span>
                  </label>
                  {!h.isClosed && (
                    <>
                      <Input
                        type="time"
                        value={h.open}
                        onChange={(e) => updateDay(d, 'open', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-neutral-400">–</span>
                      <Input
                        type="time"
                        value={h.close}
                        onChange={(e) => updateDay(d, 'close', e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Mola / engelleme zamanları</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Öğle arası veya randevu alınmayacak saat aralıklarını ekleyin.
          </p>
          <div className="mt-4 space-y-3">
            {breakTimes.map((bt, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-600 dark:bg-neutral-900/60"
              >
                <Input
                  type="time"
                  value={bt.start}
                  onChange={(e) => updateBreakTime(i, 'start', e.target.value)}
                  className="w-28"
                />
                <span className="text-neutral-400">–</span>
                <Input
                  type="time"
                  value={bt.end}
                  onChange={(e) => updateBreakTime(i, 'end', e.target.value)}
                  className="w-28"
                />
                <select
                  value={bt.dayOfWeek ?? ''}
                  onChange={(e) =>
                    updateBreakTime(
                      i,
                      'dayOfWeek',
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Tüm günler</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {DAYS_OF_WEEK[d]}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBreakTime(i)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Kaldır
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addBreakTime}>
              + Mola ekle
            </Button>
          </div>
        </Card>

        <Button type="submit" loading={saving}>
          Kaydet
        </Button>
      </form>
    </div>
  );
}

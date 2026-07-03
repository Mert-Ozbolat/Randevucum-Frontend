'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Building2, CalendarOff, UserX } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  addExceptionRange,
  countDaysInRange,
  exceptionRangesFromApi,
  exceptionRangesToApi,
  formatExceptionRangeLabel,
  removeExceptionRange,
  type ExceptionRange,
} from '@/lib/exceptionDays';

interface StaffMember {
  _id: string;
  name: string;
  title?: string;
  leaveDays?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
  }[];
}

function DateRangeFields({
  startDate,
  endDate,
  minDate,
  onStartChange,
  onEndChange,
}: {
  startDate: string;
  endDate: string;
  minDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Başlangıç
        </label>
        <Input
          type="date"
          min={minDate}
          value={startDate}
          onChange={(e) => {
            const next = e.target.value;
            onStartChange(next);
            if (endDate && next > endDate) onEndChange(next);
          }}
          className="w-44"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Bitiş
        </label>
        <Input
          type="date"
          min={startDate || minDate}
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="w-44"
        />
      </div>
    </div>
  );
}

function ExceptionRangeList({
  ranges,
  saving,
  onRemove,
  tone,
}: {
  ranges: ExceptionRange[];
  saving: boolean;
  onRemove: (id: string) => void;
  tone: 'neutral' | 'amber';
}) {
  if (ranges.length === 0) {
    return <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Kayıt yok.</p>;
  }

  const itemClass =
    tone === 'amber'
      ? 'border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20'
      : 'border-neutral-200 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-900/40';

  return (
    <ul className="mt-4 space-y-2">
      {ranges.map((range) => {
        const days = countDaysInRange(range);
        return (
          <li
            key={range.id}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${itemClass}`}
          >
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {formatExceptionRangeLabel(range)}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {days === 1 ? '1 gün' : `${days} gün`}
              </p>
              {range.reason && (
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{range.reason}</p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => onRemove(range.id)}
              disabled={saving}
            >
              Kaldır
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

export default function SpecialDaysPage() {
  const { addToast } = useToast();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [closedRanges, setClosedRanges] = useState<ExceptionRange[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [closedStart, setClosedStart] = useState('');
  const [closedEnd, setClosedEnd] = useState('');
  const [closedReason, setClosedReason] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const bizRes = await fetchMyBusinesses<{
          data: {
            _id: string;
            closedDays?: StaffMember['leaveDays'];
          }[];
        }>();
        const business = bizRes.data.data?.[0];
        if (!business || cancelled) {
          setLoading(false);
          return;
        }
        setBusinessId(business._id);
        setClosedRanges(exceptionRangesFromApi(business.closedDays));

        const staffRes = await api.get<{ data: StaffMember[] }>(
          `/staff/business/${business._id}?active=false`
        );
        if (!cancelled) {
          const list = staffRes.data.data || [];
          setStaff(list);
          if (list[0]) setSelectedStaffId(list[0]._id);
        }
      } catch {
        if (!cancelled) setError('Yüklenemedi.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedStaff = useMemo(
    () => staff.find((s) => s._id === selectedStaffId) || null,
    [staff, selectedStaffId]
  );

  const staffLeaveRanges = useMemo(
    () => exceptionRangesFromApi(selectedStaff?.leaveDays),
    [selectedStaff]
  );

  const minDate = format(new Date(), 'yyyy-MM-dd');

  const saveBusinessClosedRanges = async (next: ExceptionRange[]) => {
    if (!businessId) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/business/${businessId}`, {
        closedDays: exceptionRangesToApi(next),
      });
      setClosedRanges(next);
      addToast('success', 'İşletme kapalı günleri güncellendi.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveStaffLeaveRanges = async (staffId: string, next: ExceptionRange[]) => {
    setSaving(true);
    setError('');
    try {
      const payload = exceptionRangesToApi(next);
      await api.put(`/staff/${staffId}`, { leaveDays: payload });
      setStaff((prev) =>
        prev.map((s) => (s._id === staffId ? { ...s, leaveDays: payload } : s))
      );
      addToast('success', 'Personel izin günleri güncellendi.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddClosedRange = async () => {
    if (!closedStart) return;
    const next = addExceptionRange(
      closedRanges,
      closedStart,
      closedEnd || closedStart,
      closedReason
    );
    await saveBusinessClosedRanges(next);
    setClosedStart('');
    setClosedEnd('');
    setClosedReason('');
  };

  const handleAddLeaveRange = async () => {
    if (!selectedStaffId || !leaveStart) return;
    const next = addExceptionRange(
      staffLeaveRanges,
      leaveStart,
      leaveEnd || leaveStart,
      leaveReason
    );
    await saveStaffLeaveRanges(selectedStaffId, next);
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
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
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Önce işletme profilinizi oluşturun.</p>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Özel günler</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          İşletmeyi veya personeli tek gün veya tarih aralığı olarak kapalı/izinli işaretleyin. Bu
          günlerde randevu alınamaz.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
            <Building2 className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">İşletme kapalı günleri</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Tatil veya özel kapanış — tek gün için bitişi boş bırakabilirsiniz.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <DateRangeFields
            startDate={closedStart}
            endDate={closedEnd}
            minDate={minDate}
            onStartChange={setClosedStart}
            onEndChange={setClosedEnd}
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[12rem] flex-1">
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Açıklama (isteğe bağlı)
              </label>
              <Input
                value={closedReason}
                onChange={(e) => setClosedReason(e.target.value)}
                placeholder="Örn. Bayram tatili"
              />
            </div>
            <Button
              type="button"
              onClick={() => void handleAddClosedRange()}
              loading={saving}
              disabled={!closedStart}
            >
              Ekle
            </Button>
          </div>
        </div>

        {closedRanges.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Kapalı gün tanımlı değil.</p>
        ) : (
          <ExceptionRangeList
            ranges={closedRanges}
            saving={saving}
            tone="neutral"
            onRemove={(id) => void saveBusinessClosedRanges(removeExceptionRange(closedRanges, id))}
          />
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <UserX className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Personel izin günleri</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Seçilen personel bu tarih aralığında randevu alamaz.
            </p>
          </div>
        </div>

        {staff.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            Henüz personel yok.{' '}
            <a href="/dashboard/business/staff" className="font-medium text-primary-600 hover:underline">
              Personel ekleyin
            </a>
            .
          </p>
        ) : (
          <>
            <div className="mt-5">
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Personel
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full max-w-md rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-900"
              >
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                    {s.title ? ` — ${s.title}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 space-y-3">
              <DateRangeFields
                startDate={leaveStart}
                endDate={leaveEnd}
                minDate={minDate}
                onStartChange={setLeaveStart}
                onEndChange={setLeaveEnd}
              />
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[12rem] flex-1">
                  <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Açıklama (isteğe bağlı)
                  </label>
                  <Input
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Örn. Yıllık izin"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => void handleAddLeaveRange()}
                  loading={saving}
                  disabled={!leaveStart || !selectedStaffId}
                >
                  Ekle
                </Button>
              </div>
            </div>

            {staffLeaveRanges.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                {selectedStaff?.name} için izin kaydı yok.
              </p>
            ) : (
              <ExceptionRangeList
                ranges={staffLeaveRanges}
                saving={saving}
                tone="amber"
                onRemove={(id) =>
                  void saveStaffLeaveRanges(
                    selectedStaffId,
                    removeExceptionRange(staffLeaveRanges, id)
                  )
                }
              />
            )}
          </>
        )}
      </Card>

      <div className="flex items-start gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-300">
        <CalendarOff className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        <p>
          Haftalık kapalı günler için{' '}
          <a href="/dashboard/business/working-hours" className="font-medium text-primary-600 hover:underline">
            Çalışma Saatleri
          </a>{' '}
          sayfasını kullanın.
        </p>
      </div>
    </div>
  );
}

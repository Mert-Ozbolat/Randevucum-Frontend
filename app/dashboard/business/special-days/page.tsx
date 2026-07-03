'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Building2, CalendarOff, UserX } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  addExceptionDay,
  exceptionDayFromApi,
  exceptionDaysToApi,
  removeExceptionDay,
  sortExceptionDays,
  type ExceptionDay,
} from '@/lib/exceptionDays';

interface StaffMember {
  _id: string;
  name: string;
  title?: string;
  leaveDays?: { date: string; reason?: string }[];
}

export default function SpecialDaysPage() {
  const { addToast } = useToast();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [closedDays, setClosedDays] = useState<ExceptionDay[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [newClosedDate, setNewClosedDate] = useState('');
  const [newClosedReason, setNewClosedReason] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [newLeaveReason, setNewLeaveReason] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const bizRes = await fetchMyBusinesses<{
          data: { _id: string; closedDays?: { date: string; reason?: string }[] }[];
        }>();
        const business = bizRes.data.data?.[0];
        if (!business || cancelled) {
          setLoading(false);
          return;
        }
        setBusinessId(business._id);
        setClosedDays(
          sortExceptionDays((business.closedDays || []).map(exceptionDayFromApi))
        );

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

  const selectedStaffLeaveDays = useMemo(
    () => sortExceptionDays((selectedStaff?.leaveDays || []).map(exceptionDayFromApi)),
    [selectedStaff]
  );

  const minDate = format(new Date(), 'yyyy-MM-dd');

  const saveBusinessClosedDays = async (nextDays: ExceptionDay[]) => {
    if (!businessId) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/business/${businessId}`, {
        closedDays: exceptionDaysToApi(nextDays),
      });
      setClosedDays(nextDays);
      addToast('success', 'İşletme kapalı günleri güncellendi.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveStaffLeaveDays = async (staffId: string, nextDays: ExceptionDay[]) => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/staff/${staffId}`, {
        leaveDays: exceptionDaysToApi(nextDays),
      });
      setStaff((prev) =>
        prev.map((s) =>
          s._id === staffId ? { ...s, leaveDays: exceptionDaysToApi(nextDays) } : s
        )
      );
      addToast('success', 'Personel izin günleri güncellendi.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddClosedDay = async () => {
    if (!newClosedDate) return;
    const next = addExceptionDay(closedDays, newClosedDate, newClosedReason);
    await saveBusinessClosedDays(next);
    setNewClosedDate('');
    setNewClosedReason('');
  };

  const handleRemoveClosedDay = async (date: string) => {
    await saveBusinessClosedDays(removeExceptionDay(closedDays, date));
  };

  const handleAddLeaveDay = async () => {
    if (!selectedStaffId || !newLeaveDate) return;
    const next = addExceptionDay(selectedStaffLeaveDays, newLeaveDate, newLeaveReason);
    await saveStaffLeaveDays(selectedStaffId, next);
    setNewLeaveDate('');
    setNewLeaveReason('');
  };

  const handleRemoveLeaveDay = async (date: string) => {
    if (!selectedStaffId) return;
    await saveStaffLeaveDays(selectedStaffId, removeExceptionDay(selectedStaffLeaveDays, date));
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
          İşletmeyi veya personeli belirli tarihlerde kapalı/izinli işaretleyin. Bu günlerde randevu
          alınamaz.
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
              Tatil, bayram veya özel kapanış — tüm işletme o gün randevu kabul etmez.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Tarih
            </label>
            <Input
              type="date"
              min={minDate}
              value={newClosedDate}
              onChange={(e) => setNewClosedDate(e.target.value)}
              className="w-44"
            />
          </div>
          <div className="min-w-[12rem] flex-1">
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Açıklama (isteğe bağlı)
            </label>
            <Input
              value={newClosedReason}
              onChange={(e) => setNewClosedReason(e.target.value)}
              placeholder="Örn. Bayram tatili"
            />
          </div>
          <Button type="button" onClick={() => void handleAddClosedDay()} loading={saving} disabled={!newClosedDate}>
            Ekle
          </Button>
        </div>

        {closedDays.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Kapalı gün tanımlı değil.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {closedDays.map((day) => {
              const [y, mo, d] = day.date.split('-').map(Number);
              const label = format(new Date(y, mo - 1, d), 'd MMMM yyyy, EEEE', { locale: tr });
              return (
                <li
                  key={day.date}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900/40"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">{label}</p>
                    {day.reason && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{day.reason}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => void handleRemoveClosedDay(day.date)}
                    disabled={saving}
                  >
                    Kaldır
                  </Button>
                </li>
              );
            })}
          </ul>
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
              Seçilen personel bu günlerde randevu alamaz. Kendiniz personel listesindeyse kendi
              kaydınızı seçin.
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

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  İzin tarihi
                </label>
                <Input
                  type="date"
                  min={minDate}
                  value={newLeaveDate}
                  onChange={(e) => setNewLeaveDate(e.target.value)}
                  className="w-44"
                />
              </div>
              <div className="min-w-[12rem] flex-1">
                <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Açıklama (isteğe bağlı)
                </label>
                <Input
                  value={newLeaveReason}
                  onChange={(e) => setNewLeaveReason(e.target.value)}
                  placeholder="Örn. Yıllık izin"
                />
              </div>
              <Button
                type="button"
                onClick={() => void handleAddLeaveDay()}
                loading={saving}
                disabled={!newLeaveDate || !selectedStaffId}
              >
                Ekle
              </Button>
            </div>

            {selectedStaffLeaveDays.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                {selectedStaff?.name} için izin günü yok.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {selectedStaffLeaveDays.map((day) => {
                  const [y, mo, d] = day.date.split('-').map(Number);
                  const label = format(new Date(y, mo - 1, d), 'd MMMM yyyy, EEEE', { locale: tr });
                  return (
                    <li
                      key={day.date}
                      className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20"
                    >
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{label}</p>
                        {day.reason && (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{day.reason}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => void handleRemoveLeaveDay(day.date)}
                        disabled={saving}
                      >
                        Kaldır
                      </Button>
                    </li>
                  );
                })}
              </ul>
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
          sayfasını kullanın. Burada yalnızca belirli tarihler tanımlanır.
        </p>
      </div>
    </div>
  );
}

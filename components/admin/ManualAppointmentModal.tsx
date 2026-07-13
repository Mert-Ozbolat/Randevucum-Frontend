'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, startOfDay } from 'date-fns';
import { CalendarPlus, Search, User, UserPlus, X } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { CalendarPicker } from '@/components/calendar/CalendarPicker';
import { TimeSlotGrid, type SlotOption } from '@/components/calendar/TimeSlotGrid';
import { fetchBlockedDates } from '@/lib/blockedDates';
import {
  createManualReservation,
  searchBusinessCustomers,
  type BusinessCustomerSearchResult,
} from '@/lib/manualReservation';
import { phoneDigitsOnly } from '@/lib/phone';
import type { BusinessReservation } from '@/contexts/BusinessReservationsLiveContext';

interface Service {
  _id: string;
  name: string;
  durationMinutes: number;
  staffIds?: string[];
}

interface StaffMember {
  _id: string;
  name: string;
  title?: string;
  serviceIds?: (string | { _id: string })[];
}

interface ManualAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  defaultDate?: Date;
  defaultStaffId?: string | null;
  onSuccess?: (reservation: BusinessReservation) => void;
}

function serviceIdFromRef(x: string | { _id: string }): string {
  return typeof x === 'string' ? x : x._id;
}

function staffOffersService(member: StaffMember, service: Service | null): boolean {
  if (!service) return true;
  const assigned = service.staffIds;
  if (assigned && assigned.length > 0) {
    return assigned.some((id) => String(id) === member._id);
  }
  const ids = member.serviceIds;
  if (!ids || ids.length === 0) return true;
  return ids.some((x) => serviceIdFromRef(x) === service._id);
}

function buildSlotOptions(availableSlots: string[], selectedDate: Date): SlotOption[] {
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(selectedDate);
  const isToday = selectedDay.getTime() === today.getTime();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  return availableSlots
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .map((timeStr) => {
      const [hh, mm] = timeStr.split(':');
      const m = Number(hh) * 60 + Number(mm);
      const isPast = isToday && m <= nowMinutes;
      return { time: timeStr, status: isPast ? 'past' : 'available' } satisfies SlotOption;
    });
}

function customerLabel(c: BusinessCustomerSearchResult): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

export function ManualAppointmentModal({
  open,
  onClose,
  businessId,
  defaultDate,
  defaultStaffId,
  onSuccess,
}: ManualAppointmentModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState<string | null>(defaultStaffId ?? null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultDate ?? null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [blockedDateKeys, setBlockedDateKeys] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');

  const [customerMode, setCustomerMode] = useState<'search' | 'new'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessCustomerSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<BusinessCustomerSearchResult | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedService = useMemo(
    () => services.find((s) => s._id === serviceId) || null,
    [services, serviceId]
  );

  const eligibleStaff = useMemo(() => {
    if (!selectedService) return staffList;
    return staffList.filter((s) => staffOffersService(s, selectedService));
  }, [staffList, selectedService]);

  const resetForm = useCallback(() => {
    setServiceId('');
    setStaffId(defaultStaffId ?? null);
    setSelectedDate(defaultDate ?? null);
    setSelectedTime(null);
    setNotes('');
    setCustomerMode('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCustomer(null);
    setGuestName('');
    setGuestPhone('');
    setError('');
  }, [defaultDate, defaultStaffId]);

  useEffect(() => {
    if (!open) return;
    resetForm();
    void Promise.all([
      api.get<{ data: Service[] }>(`/services/business/${businessId}`),
      api.get<{ data: StaffMember[] }>(`/staff/business/${businessId}`),
    ])
      .then(([servicesRes, staffRes]) => {
        const list = Array.isArray(servicesRes.data.data) ? servicesRes.data.data : [];
        setServices(list);
        setStaffList(Array.isArray(staffRes.data.data) ? staffRes.data.data : []);
        if (list.length === 1) setServiceId(list[0]._id);
      })
      .catch(() => setError('Hizmet veya personel listesi yüklenemedi.'));
  }, [open, businessId, resetForm]);

  useEffect(() => {
    if (!open || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      setSearchLoading(true);
      void searchBusinessCustomers(businessId, searchQuery.trim())
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [open, businessId, searchQuery]);

  useEffect(() => {
    setSelectedTime(null);
  }, [staffId, serviceId]);

  useEffect(() => {
    if (!open || !serviceId) {
      setBlockedDateKeys(new Set());
      return;
    }
    void fetchBlockedDates({ businessId, serviceId, staffId, daysCount: 21 })
      .then(setBlockedDateKeys)
      .catch(() => setBlockedDateKeys(new Set()));
  }, [open, businessId, serviceId, staffId]);

  useEffect(() => {
    if (!selectedDate) return;
    const key = format(selectedDate, 'yyyy-MM-dd');
    if (blockedDateKeys.has(key)) {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [blockedDateKeys, selectedDate]);

  useEffect(() => {
    if (!open || !serviceId || !selectedDate) return;
    setLoadingSlots(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    api
      .get<{ data: { slots: string[] } }>('/reservations/available-slots', {
        params: {
          businessId,
          serviceId,
          date: dateStr,
          ...(staffId ? { staffId } : {}),
        },
      })
      .then((res) => setSlots(res.data.data?.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [open, businessId, serviceId, selectedDate, staffId]);

  const slotOptions = selectedDate ? buildSlotOptions(slots, selectedDate) : [];

  const handleSubmit = async () => {
    setError('');
    if (!serviceId) {
      setError('Hizmet seçin.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      setError('Tarih ve saat seçin.');
      return;
    }

    let payload: Parameters<typeof createManualReservation>[1];

    if (customerMode === 'search') {
      if (!selectedCustomer) {
        setError('Müşteri seçin veya yeni müşteri ekleyin.');
        return;
      }
      payload = {
        serviceId,
        staffId: staffId || undefined,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        notes: notes.trim() || undefined,
        customerId: selectedCustomer._id,
      };
    } else {
      if (!guestName.trim() || guestName.trim().length < 2) {
        setError('Ad soyad girin.');
        return;
      }
      const digits = phoneDigitsOnly(guestPhone);
      if (digits.length < 10) {
        setError('Geçerli bir telefon numarası girin.');
        return;
      }
      payload = {
        serviceId,
        staffId: staffId || undefined,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        notes: notes.trim() || undefined,
        guestName: guestName.trim(),
        customerPhone: guestPhone,
      };
    }

    setSubmitting(true);
    try {
      const reservation = (await createManualReservation(
        businessId,
        payload
      )) as BusinessReservation;
      onSuccess?.(reservation);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-appointment-title"
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:max-h-[90vh] sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-700 sm:px-5">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary-500" strokeWidth={2} aria-hidden />
            <h2 id="manual-appointment-title" className="text-lg font-bold text-neutral-900 dark:text-white">
              Manuel randevu
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Müşteri</h3>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setCustomerMode('search')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ${
                  customerMode === 'search'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                <Search className="h-4 w-4" aria-hidden />
                Kayıtlı ara
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('new')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ${
                  customerMode === 'new'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                Yeni müşteri
              </button>
            </div>

            {customerMode === 'search' ? (
              <div className="space-y-3">
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedCustomer(null);
                  }}
                  placeholder="Ad, soyad veya telefon"
                  autoComplete="off"
                />
                {searchLoading && (
                  <p className="text-xs text-neutral-500">Aranıyor…</p>
                )}
                {!searchLoading && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <p className="rounded-xl border border-dashed border-neutral-200 px-3 py-4 text-center text-sm text-neutral-500 dark:border-neutral-700">
                    Sonuç yok. Daha önce randevu almış müşteri bulunamadı — &quot;Yeni müşteri&quot; sekmesini deneyin.
                  </p>
                )}
                {searchResults.length > 0 && (
                  <ul className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-neutral-200 p-1 dark:border-neutral-700">
                    {searchResults.map((c) => {
                      const selected = selectedCustomer?._id === c._id;
                      return (
                        <li key={c._id}>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                              selected
                                ? 'bg-primary-50 text-primary-900 dark:bg-primary-950/50 dark:text-primary-100'
                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                            }`}
                          >
                            <User className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                            <span>
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                {customerLabel(c)}
                              </span>
                              {c.phone && (
                                <span className="mt-0.5 block text-xs text-neutral-500">{c.phone}</span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {selectedCustomer && (
                  <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                    Seçili: {customerLabel(selectedCustomer)}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  label="Ad soyad"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Örn: Ayşe Yılmaz"
                  required
                />
                <PhoneInput
                  label="Telefon"
                  value={guestPhone}
                  onChange={setGuestPhone}
                  required
                  hint="WhatsApp bildirimleri için kullanılır."
                />
              </div>
            )}
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Hizmet & personel</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="manual-service" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Hizmet
                </label>
                <select
                  id="manual-service"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                >
                  <option value="">Hizmet seçin</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.durationMinutes} dk)
                    </option>
                  ))}
                </select>
              </div>

              {eligibleStaff.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Personel (isteğe bağlı)</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStaffId(null)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                        staffId === null
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      Farketmez
                    </button>
                    {eligibleStaff.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => setStaffId(s._id)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                          staffId === s._id
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {serviceId && (
            <section className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Tarih & saat</h3>
              <CalendarPicker
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                minDate={new Date()}
                daysCount={21}
                disabledDateKeys={blockedDateKeys}
              />
              {selectedDate && (
                <div className="mt-4">
                  <TimeSlotGrid
                    slots={slotOptions}
                    selectedTime={selectedTime}
                    onSelectTime={setSelectedTime}
                    loading={loadingSlots}
                    isBusinessOwner
                  />
                </div>
              )}
            </section>
          )}

          <section className="mb-2">
            <Input
              label="Not (isteğe bağlı)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Telefonla alındı"
              maxLength={500}
            />
          </section>
        </div>

        <div className="shrink-0 border-t border-neutral-200 bg-white px-4 py-4 dark:border-neutral-700 dark:bg-neutral-900 sm:px-5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Vazgeç
            </Button>
            <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? 'Kaydediliyor…' : 'Randevu oluştur'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

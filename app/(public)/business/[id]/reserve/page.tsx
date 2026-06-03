'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api, getApiErrorMessage } from '@/lib/api';
import { getStoredToken, getStoredUser, setAuth } from '@/lib/auth';
import { format, startOfDay } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CalendarPicker } from '@/components/calendar/CalendarPicker';
import { TimeSlotGrid, type SlotOption } from '@/components/calendar/TimeSlotGrid';
import { ReservationModal } from '@/components/reservation/ReservationModal';
import { useToast } from '@/components/ui/Toast';
import { formatServicePriceLabel } from '@/lib/servicePrice';
import { Check, Users } from 'lucide-react';
import { formatTrMobile, phoneDigitsOnly, phoneInputFromStored } from '@/lib/phone';

interface Service {
  _id: string;
  name: string;
  durationMinutes: number;
  price?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string;
  staffIds?: string[];
}

interface Business {
  _id: string;
  name: string;
}

interface StaffMember {
  _id: string;
  name: string;
  serviceIds?: (string | { _id: string })[];
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

function buildSlotOptions(
  availableSlots: string[],
  selectedDate: Date
): SlotOption[] {
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(selectedDate);
  const isToday = selectedDay.getTime() === today.getTime();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return availableSlots
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .map((timeStr) => {
      const [hh, mm] = timeStr.split(':');
      const m = Number(hh) * 60 + Number(mm);
      const isPast = isToday && m <= nowMinutes;
      return {
        time: timeStr,
        status: isPast ? 'past' : 'available',
      } satisfies SlotOption;
    });
}

export default function ReservePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const businessId = params.id as string;
  const serviceId = searchParams.get('serviceId');
  const { addToast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [success, setSuccess] = useState(false);
  const [businessName, setBusinessName] = useState<string>('');
  const [phone, setPhone] = useState<string>(() => phoneInputFromStored(getStoredUser()?.phone));
  const [needsPhone, setNeedsPhone] = useState<boolean>(() => {
    const u = getStoredUser();
    const p = u?.phone ? String(u.phone).trim() : '';
    return !p;
  });
  const phoneRequiredByApi = useMemo(() => {
    const msg = String(reserveError || '').toLowerCase();
    return msg.includes('telefon numarası gerekli') || msg.includes('telefon numarasi gerekli');
  }, [reserveError]);
  const requirePhoneForThisReservation = needsPhone || phoneRequiredByApi;

  // Keep localStorage user in sync with backend (phone may be missing in DB even if LS is stale).
  useEffect(() => {
    api
      .get<{ data: { phone?: string } }>('/auth/me')
      .then((res) => {
        const u = getStoredUser();
        const token = getStoredToken();
        const phoneFromApi = res.data.data?.phone ? String(res.data.data.phone).trim() : '';
        if (phoneFromApi) {
          setPhone(formatTrMobile(phoneFromApi));
          setNeedsPhone(false);
          if (token && u && !u.phone) {
            setAuth(token, { ...u, phone: phoneFromApi });
          }
        } else {
          setNeedsPhone(true);
        }
      })
      .catch(() => {
        // ignore; fall back to localStorage
      });
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      const q = searchParams.toString();
      const path = q ? `${pathname}?${q}` : pathname;
      router.replace(`/login?from=${encodeURIComponent(path)}`);
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    api.get<{ data: Business }>(`/business/${businessId}`).then((res) => setBusinessName(res.data.data?.name ?? '')).catch(() => {});
  }, [businessId]);

  useEffect(() => {
    api
      .get<{ data: StaffMember[] }>(`/staff/business/${businessId}`)
      .then((res) => setStaffList(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setStaffList([]));
  }, [businessId]);

  useEffect(() => {
    if (!serviceId) return;
    api
      .get<{ data: Service[] }>(`/services/business/${businessId}`)
      .then((res) => {
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        const s = list.find((x: Service) => x._id === serviceId) || null;
        setService(s);
      })
      .catch(() => setError('Hizmet bulunamadı.'));
  }, [businessId, serviceId]);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedStaffId]);

  useEffect(() => {
    if (!serviceId || !selectedDate) return;
    setLoadingSlots(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    api
      .get<{ data: { slots: string[] } }>('/reservations/available-slots', {
        params: {
          businessId,
          serviceId,
          date: dateStr,
          ...(selectedStaffId ? { staffId: selectedStaffId } : {}),
        },
      })
      .then((res) => setSlots(res.data.data?.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [businessId, serviceId, selectedDate, selectedStaffId]);

  const slotOptions = selectedDate ? buildSlotOptions(slots, selectedDate) : [];
  const servicePriceLabel = service ? formatServicePriceLabel(service) : null;

  const eligibleStaff = useMemo(() => {
    if (!service) return [];
    return staffList.filter((s) => staffOffersService(s, service));
  }, [staffList, service]);

  const reservationStaffLabel =
    eligibleStaff.length > 0
      ? selectedStaffId
        ? eligibleStaff.find((s) => s._id === selectedStaffId)?.name ?? ''
        : 'Farketmez (müsait personel)'
      : undefined;

  const handleSlotSelect = (time: string) => {
    setSelectedTime(time);
    // Compute at modal-open time so we reliably show the field.
    const u = getStoredUser();
    const p = u?.phone ? String(u.phone).trim() : '';
    setNeedsPhone(!p);
    setModalOpen(true);
  };

  const handleConfirm = async (phoneFromModal?: string) => {
    if (!selectedDate || !selectedTime || !service) return;
    setReserveError('');
    setReserveLoading(true);
    try {
      const u = getStoredUser();
      const phoneCandidateA = (phoneFromModal ?? '') as string;
      const phoneCandidateB = (phone ?? '') as string;
      const phoneInput =
        phoneDigitsOnly(phoneCandidateA).length > 0
          ? phoneCandidateA
          : phoneDigitsOnly(phoneCandidateB).length > 0
            ? phoneCandidateB
            : phoneCandidateA || phoneCandidateB || '';

      const phoneDigits = phoneDigitsOnly(phoneInput);
      // TR mobile should be 10 digits (5xxxxxxxxx) after trimming prefixes.
      let normalizedDigits = phoneDigits;
      if (normalizedDigits.startsWith('90')) normalizedDigits = normalizedDigits.slice(2);
      if (normalizedDigits.startsWith('0')) normalizedDigits = normalizedDigits.slice(1);
      normalizedDigits = normalizedDigits.slice(0, 10);
      if (requirePhoneForThisReservation && normalizedDigits.length < 10) {
        setReserveError('Telefon numarası gerekli.');
        return;
      }
      await api.post('/reservations', {
        businessId,
        serviceId,
        ...(selectedStaffId ? { staffId: selectedStaffId } : {}),
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        notes: notes || undefined,
        ...(requirePhoneForThisReservation ? { customerPhone: String(phoneInput).trim() } : {}),
      });
      if (requirePhoneForThisReservation) {
        const token = getStoredToken();
        if (token && u) {
          // Store pretty formatted version on client; backend will normalize to E.164.
          const pretty = formatTrMobile(phoneInput) || String(phoneInput).trim();
          const updated = { ...u, phone: pretty };
          setAuth(token, updated);
          setPhone(pretty);
          setNeedsPhone(false);
        }
      }
      addToast('success', 'Randevunuz alındı.');
      setSuccess(true);
      setModalOpen(false);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setReserveError(msg);
      if (msg.toLowerCase().includes('telefon numarası gerekli') || msg.toLowerCase().includes('telefon numarasi gerekli')) {
        setNeedsPhone(true);
      }
    } finally {
      setReserveLoading(false);
    }
  };

  if (!serviceId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <p className="text-red-600">Hizmet seçilmedi.</p>
        <Link
          href={`/business/${businessId}`}
          className="mt-4 inline-block text-primary-600 hover:underline"
        >
          ← İşletmeye dön
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
            <Check className="h-7 w-7" strokeWidth={2.5} aria-hidden />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">Randevu onaylandı</h1>
          <p className="mt-2 text-neutral-600">
            Randevunuz alındı. İşletme onayından sonra bilgilendirileceksiniz.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link href="/dashboard/customer/reservations" className="order-first">
              <Button fullWidth className="sm:w-auto">
                Randevularıma Git
              </Button>
            </Link>
            <Link href={`/business/${businessId}`}>
              <Button variant="outline" fullWidth className="sm:w-auto">
                İşletmeye Dön
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href={`/business/${businessId}`}
        className="text-sm font-medium text-primary-600 hover:underline"
      >
        ← İşletmeye dön
      </Link>
      {service && (
        <p className="mt-2 text-sm text-neutral-600">
          Hizmet: <strong>{service.name}</strong> ({service.durationMinutes} dk)
          {servicePriceLabel && (
            <span className="text-neutral-800 dark:text-neutral-200">
              {' '}
              · {servicePriceLabel}
            </span>
          )}
        </p>
      )}

      {eligibleStaff.length > 0 && (
        <div
          className="relative mt-6 overflow-hidden rounded-2xl border-2 border-primary-500 bg-gradient-to-br from-primary-50 via-white to-primary-50/80 p-5 shadow-[0_8px_30px_-8px_rgba(59,130,246,0.35)] dark:border-primary-500/70 dark:from-primary-950/80 dark:via-neutral-900 dark:to-primary-950/50 dark:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.25)] sm:p-6"
          role="region"
          aria-labelledby="reserve-staff-heading"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-400/20 blur-2xl dark:bg-primary-500/20" aria-hidden />
          <div className="relative flex gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-md dark:bg-primary-500">
              <Users className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                Randevu için
              </p>
              <h2
                id="reserve-staff-heading"
                className="mt-0.5 text-lg font-bold text-neutral-900 dark:text-white sm:text-xl"
              >
                Personel seçin{' '}
                <span className="font-semibold text-primary-700 dark:text-primary-300">(isteğe bağlı)</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                <strong className="text-neutral-900 dark:text-white">Farketmez</strong> müsait personel atanır. Bir isim
                seçerseniz yalnızca <strong className="text-neutral-900 dark:text-white">o kişinin</strong> uygun
                saatleri görürsünüz.
              </p>
            </div>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2.5 border-t border-primary-200/80 pt-5 dark:border-primary-800/60">
            <button
              type="button"
              onClick={() => setSelectedStaffId(null)}
              className={`min-h-[46px] rounded-xl border-2 px-4 py-2.5 text-base font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${
                selectedStaffId === null
                  ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-600'
                  : 'border-neutral-200 bg-white text-neutral-900 hover:border-primary-400 hover:bg-primary-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
              }`}
            >
              Farketmez
            </button>
            {eligibleStaff.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => setSelectedStaffId(s._id)}
                className={`min-h-[46px] rounded-xl border-2 px-4 py-2.5 text-base font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${
                  selectedStaffId === s._id
                    ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-600'
                    : 'border-neutral-200 bg-white text-neutral-900 hover:border-primary-400 hover:bg-primary-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Card className="mt-6 space-y-6 p-6">
        <h2 className="font-semibold text-neutral-900">Tarih seçin</h2>
        <CalendarPicker
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          minDate={new Date()}
          daysCount={14}
        />
      </Card>

      {selectedDate && (
        <Card className="mt-6 p-6">
          <button
            type="button"
            onClick={() => setSelectedDate(null)}
            className="text-sm text-primary-600 hover:underline"
          >
            ← Tarih değiştir
          </button>
          <h2 className="mt-2 font-semibold text-neutral-900">
            Saat seçin — {format(selectedDate, 'd MMMM yyyy')}
          </h2>
          <div className="mt-4">
            <TimeSlotGrid
              slots={slotOptions}
              selectedTime={selectedTime}
              onSelectTime={handleSlotSelect}
              loading={loadingSlots}
              isBusinessOwner={false}
            />
          </div>
        </Card>
      )}

      <ReservationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setReserveError('');
        }}
        businessName={businessName}
        serviceName={service?.name ?? ''}
        staffLabel={reservationStaffLabel}
        date={selectedDate ?? new Date()}
        time={selectedTime ?? ''}
        durationMinutes={service?.durationMinutes}
        notes={notes}
        onNotesChange={setNotes}
        phone={phone}
        onPhoneChange={(v) => {
          setPhone(formatTrMobile(v));
          if (reserveError) setReserveError('');
        }}
        requirePhone={requirePhoneForThisReservation}
        onConfirm={handleConfirm}
        loading={reserveLoading}
        error={reserveError}
      />
    </div>
  );
}

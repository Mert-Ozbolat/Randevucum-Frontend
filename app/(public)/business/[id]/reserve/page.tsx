'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api, getApiErrorMessage } from '@/lib/api';
import { getStoredToken } from '@/lib/auth';
import { format, startOfDay } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CalendarPicker } from '@/components/calendar/CalendarPicker';
import { TimeSlotGrid, type SlotOption } from '@/components/calendar/TimeSlotGrid';
import { ReservationModal } from '@/components/reservation/ReservationModal';
import { useToast } from '@/components/ui/Toast';
import { Check } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  durationMinutes: number;
  price?: number;
}

interface Business {
  _id: string;
  name: string;
}

const DEFAULT_SLOT_START = 9 * 60;
const DEFAULT_SLOT_END = 18 * 60;
const SLOT_STEP = 30;

function buildSlotOptions(
  availableSlots: string[],
  selectedDate: Date
): SlotOption[] {
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(selectedDate);
  const isToday = selectedDay.getTime() === today.getTime();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const options: SlotOption[] = [];
  for (let m = DEFAULT_SLOT_START; m < DEFAULT_SLOT_END; m += SLOT_STEP) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    const isPast = isToday && m <= nowMinutes;
    const available = availableSlots.includes(timeStr);
    options.push({
      time: timeStr,
      status: isPast ? 'past' : available ? 'available' : 'full',
    });
  }
  return options;
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
    if (!serviceId || !selectedDate) return;
    setLoadingSlots(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    api
      .get<{ data: { slots: string[] } }>('/reservations/available-slots', {
        params: { businessId, serviceId, date: dateStr },
      })
      .then((res) => setSlots(res.data.data?.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [businessId, serviceId, selectedDate]);

  const slotOptions = selectedDate ? buildSlotOptions(slots, selectedDate) : [];

  const handleSlotSelect = (time: string) => {
    setSelectedTime(time);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !service) return;
    setReserveError('');
    setReserveLoading(true);
    try {
      await api.post('/reservations', {
        businessId,
        serviceId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        notes: notes || undefined,
      });
      addToast('success', 'Randevunuz alındı.');
      setSuccess(true);
      setModalOpen(false);
    } catch (err) {
      setReserveError(getApiErrorMessage(err));
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
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">Rezervasyon Onaylandı</h1>
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
        </p>
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
        date={selectedDate ?? new Date()}
        time={selectedTime ?? ''}
        durationMinutes={service?.durationMinutes}
        notes={notes}
        onNotesChange={setNotes}
        onConfirm={handleConfirm}
        loading={reserveLoading}
        error={reserveError}
      />
    </div>
  );
}

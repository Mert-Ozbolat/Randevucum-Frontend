'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BUSINESS_TYPES, DAYS_OF_WEEK } from '@/lib/constants';
import { BUSINESS_TYPE_LABELS } from '@/lib/businessCategories';
import { BusinessGallery } from '@/components/business/BusinessGallery';
import { CalendarPicker } from '@/components/calendar/CalendarPicker';
import { TimeSlotGrid, type SlotOption } from '@/components/calendar/TimeSlotGrid';
import { ReservationModal } from '@/components/reservation/ReservationModal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { format, startOfDay } from 'date-fns';
import { api as apiLib, getApiErrorMessage } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Clock, MapPin, Phone, Star } from 'lucide-react';

interface Business {
  _id: string;
  name: string;
  businessType: string;
  address?: { street?: string; city?: string; district?: string; postalCode?: string };
  phone?: string;
  email?: string;
  description?: string;
  imageUrl?: string | null;
  rating?: number | null;
  location?: { lat?: number; lng?: number };
  workingHours?: { dayOfWeek: number; open: string; close: string; isClosed: boolean }[];
}

interface Service {
  _id: string;
  name: string;
  durationMinutes: number;
  price?: number;
  currency?: string;
}

interface Staff {
  _id: string;
  name: string;
  title?: string;
}

const DEFAULT_SLOT_START = 9 * 60;
const DEFAULT_SLOT_END = 18 * 60;
const SLOT_STEP = 30;

interface Review {
  _id: string;
  businessId: string;
  customerId: { firstName: string; lastName: string };
  rating: number;
  comment: string;
  createdAt?: string;
}

function buildSlotOptions(
  availableSlots: string[],
  selectedDate: Date,
  _isBusinessOwner: boolean
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
      label: undefined,
    });
  }
  return options;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { token } = useAuthStore();
  const { addToast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [postingReview, setPostingReview] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<{ data: Business }>(`/business/${id}`),
      api.get<{ data: Service[] }>(`/services/business/${id}`),
      api.get<{ data: Staff[] }>(`/staff/business/${id}`).catch(() => ({ data: { data: [] } })),
    ])
      .then(([bRes, sRes, staffRes]) => {
        setBusiness(bRes.data.data);
        setServices(Array.isArray(sRes.data.data) ? sRes.data.data : []);
        setStaff(Array.isArray((staffRes as { data: { data: Staff[] } }).data?.data) ? (staffRes as { data: { data: Staff[] } }).data.data : []);
      })
      .catch(() => setError('İşletme yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoadingReviews(true);
    api
      .get<{ data: Review[] }>(`/reviews/business/${id}`)
      .then((res) => setReviews(res.data.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [id]);

  useEffect(() => {
    if (!selectedServiceId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    setLoadingSlots(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    api
      .get<{ data: { slots: string[] } }>('/reservations/available-slots', {
        params: { businessId: id, serviceId: selectedServiceId, date: dateStr },
      })
      .then((res) => setAvailableSlots(res.data.data?.slots || []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [id, selectedServiceId, selectedDate]);

  const selectedService = services.find((s) => s._id === selectedServiceId);
  const slotOptions = selectedDate
    ? buildSlotOptions(availableSlots, selectedDate, false)
    : [];

  const handleSlotSelect = (time: string) => {
    if (!token) {
      router.push(`/login?from=${encodeURIComponent(`/business/${id}`)}`);
      return;
    }
    setSelectedTime(time);
    setModalOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (!selectedDate || !selectedTime || !selectedServiceId || !business) return;
    setReserveError('');
    setReserveLoading(true);
    try {
      await apiLib.post('/reservations', {
        businessId: id,
        serviceId: selectedServiceId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        notes: notes || undefined,
      });
      addToast('success', 'Randevunuz alındı.');
      setModalOpen(false);
      setSelectedTime(null);
      setNotes('');
      setAvailableSlots((prev) => prev.filter((t) => t !== selectedTime));
    } catch (err) {
      setReserveError(getApiErrorMessage(err));
    } finally {
      setReserveLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!token) {
      router.push(`/login?from=${encodeURIComponent(`/business/${id}`)}`);
      return;
    }
    if (!reviewComment.trim()) {
      addToast('error', 'Yorumunuz boş olamaz.');
      return;
    }

    setPostingReview(true);
    try {
      await apiLib.post('/reviews', {
        businessId: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      addToast('success', 'Yorumunuz kaydedildi.');
      setReviewComment('');
      setReviewRating(5);
      // listeyi güncel tut
      const res = await api.get<{ data: Review[] }>(`/reviews/business/${id}`);
      setReviews(res.data.data || []);
    } catch (err) {
      addToast('error', getApiErrorMessage(err));
    } finally {
      setPostingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      </div>
    );
  }
  if (error || !business) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-red-600">{error || 'İşletme bulunamadı.'}</p>
        <Link href="/business" className="mt-4 inline-block text-primary-600 hover:underline">
          ← İşletmelere dön
        </Link>
      </div>
    );
  }

  const addressParts = [
    business.address?.street,
    business.address?.district,
    business.address?.city,
  ].filter(Boolean);
  const addressStr = addressParts.join(', ');
  const mapsQuery =
    business.location?.lat != null && business.location?.lng != null
      ? `${business.location.lat},${business.location.lng}`
      : addressStr || business.name;
  const mapsQueryEncoded = encodeURIComponent(mapsQuery);
  const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQueryEncoded}&output=embed`;
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQueryEncoded}`;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : business.rating ?? 4.7;
  const reviewCount = reviews.length;

  const stepProgress = selectedServiceId
    ? selectedDate
      ? selectedTime
        ? 4
        : 3
      : 2
    : 1;

  const sectionClass = 'rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft transition hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] dark:border-neutral-700 dark:bg-neutral-800';
  const sectionTitleClass = 'text-lg font-bold text-neutral-900 dark:text-white';

  const workingHoursList = business.workingHours?.length
    ? business.workingHours
    : [0, 1, 2, 3, 4, 5, 6].map((d) => ({ dayOfWeek: d, open: '09:00', close: '18:00', isClosed: d === 0 }));

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/business"
          className="inline-flex items-center text-sm font-semibold text-primary-600 transition hover:text-primary-700 dark:text-primary-400"
        >
          ← İşletmelere dön
        </Link>

        {/* Hero: Kapak + gradient + isim, kategori, konum */}
        <div className="mt-6">
          <BusinessGallery
            businessName={business.name}
            businessType={business.businessType}
            imageUrl={business.imageUrl}
            locationText={business.address?.city || business.address?.district || undefined}
            showHeroOverlay
          />
        </div>

        {/* Üst bilgi: isim, puan, kategori, harita + randevu */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
              <span>{business.name}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-base font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden />
                {avgRating.toFixed(1)}
              </span>
            </h1>
            <p className="mt-1 text-primary-600 dark:text-primary-400">
              {BUSINESS_TYPE_LABELS[business.businessType] || BUSINESS_TYPES[business.businessType] || business.businessType}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {mapsQuery && (
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-card transition hover:border-primary-500 hover:text-primary-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:hover:border-primary-500"
              >
                <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                Haritada aç
              </a>
            )}
            <Link
              href="#randevu-al"
              className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
            >
              Randevu al
            </Link>
          </div>
        </div>

        {/* Çalışma saatleri */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
            <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" strokeWidth={1.75} aria-hidden />
            Çalışma saatleri
          </h2>
          <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
            <ul className="space-y-2">
              {workingHoursList.map((wh) => (
                <li key={wh.dayOfWeek} className="flex justify-between text-sm">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {DAYS_OF_WEEK[wh.dayOfWeek]}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-300">
                    {wh.isClosed ? 'Kapalı' : `${wh.open} – ${wh.close}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Telefon & Adres – ikonlu, tıklanabilir */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {business.phone && (
            <a
              href={`tel:${business.phone.replace(/\s/g, '')}`}
              className={`flex items-center gap-4 ${sectionClass} group`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <Phone className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Telefon
                </p>
                <p className="font-semibold text-neutral-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                  {business.phone}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Tıklayarak ara</p>
              </div>
            </a>
          )}
          {addressStr && (
            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 ${sectionClass} group`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
                <MapPin className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Adres
                </p>
                <p className="font-semibold text-neutral-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 line-clamp-2">
                  {addressStr}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Haritada aç</p>
              </div>
            </a>
          )}
        </div>

        {/* Haritada göster – gerçek harita iframe */}
        {mapsQuery && (
          <section className="mt-10">
            <h2 className={sectionTitleClass}>Haritada göster</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
              <iframe
                title="Konum haritası"
                src={mapsEmbedUrl}
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block w-full"
              />
              <div className="border-t border-neutral-200 bg-neutral-100 p-3 text-center dark:border-neutral-700 dark:bg-neutral-800">
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                >
                  Google Maps&apos;te aç →
                </a>
              </div>
            </div>
          </section>
        )}

        {business.description && (
          <section className="mt-10">
            <h2 className={sectionTitleClass}>Hakkında</h2>
            <p className="mt-3 rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-600 shadow-card dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {business.description}
            </p>
          </section>
        )}

        {/* Yorum & Puan */}
        <section className="mt-10">
          <h2 className={sectionTitleClass}>Yorumlar ve puan</h2>

          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-2xl font-bold text-neutral-900 dark:text-white">
                <Star className="h-7 w-7 fill-amber-400 text-amber-500" aria-hidden />
                {avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">({reviewCount} yorum)</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white">Yorum bırak</h3>
            {!token ? (
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                Yorum yapabilmek için <Link href="/login" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">giriş yap</Link>.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      className="transition hover:scale-110"
                      aria-label={`${n} yıldız`}
                    >
                      <Star
                        className={`h-7 w-7 transition ${
                          n <= reviewRating
                            ? 'fill-amber-400 text-amber-500 stroke-amber-500'
                            : 'fill-transparent text-neutral-300 stroke-neutral-300 hover:text-amber-400 hover:stroke-amber-400 dark:text-neutral-600 dark:stroke-neutral-600 dark:hover:text-amber-400 dark:hover:stroke-amber-400'
                        }`}
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    {reviewRating}/5
                  </span>
                </div>

                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Deneyimini yaz..."
                  rows={3}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                />

                {reviewComment.trim().length === 0 && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Yorum boş olamaz.
                  </p>
                )}

                {reviewComment.trim().length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handleSubmitReview}
                      loading={postingReview}
                      className="min-w-[180px]"
                      disabled={postingReview}
                    >
                      Yorumu Kaydet
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-4">
            {loadingReviews ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-700 dark:bg-neutral-800">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  Yorumlar yükleniyor...
                </p>
              </div>
            ) : reviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-6 text-center text-sm text-neutral-600 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-300">
                Henüz yorum yok. İlk yorumu sen bırak.
              </p>
            ) : (
              reviews.map((r) => (
                <div
                  key={r._id}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {r.customerId?.firstName} {r.customerId?.lastName}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-500" aria-hidden>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 ${
                            n <= r.rating
                              ? 'fill-amber-400 text-amber-500'
                              : 'fill-transparent text-neutral-300 dark:text-neutral-600'
                          }`}
                          strokeWidth={1.5}
                        />
                      ))}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('tr-TR') : ''}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">&ldquo;{r.comment}&rdquo;</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Hizmetler – kart tasarımı */}
        <section className="mt-12">
          <h2 className={sectionTitleClass}>Hizmetler</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Bir hizmet seçin, ardından tarih ve saat belirleyin.
          </p>
          {services.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-100 p-8 text-center text-neutral-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              Henüz hizmet tanımlanmamış.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {services.map((s) => (
                <div
                  key={s._id}
                  onClick={() => setSelectedServiceId(s._id)}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-white p-5 shadow-card transition hover:scale-[1.02] hover:shadow-soft dark:bg-neutral-800 ${
                    selectedServiceId === s._id
                      ? 'border-primary-500 ring-2 ring-primary-500 dark:border-primary-500'
                      : 'border-neutral-200 hover:border-primary-300 dark:border-neutral-700'
                  }`}
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-neutral-900 dark:text-white">{s.name}</h3>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{s.durationMinutes} dk</p>
                    {s.price != null && (
                      <p className="mt-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {s.price} {s.currency || '₺'}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={selectedServiceId === s._id ? 'primary' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedServiceId(s._id);
                    }}
                  >
                    {selectedServiceId === s._id ? 'Seçildi' : 'Seç'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {staff.length > 0 && (
          <section className="mt-10">
            <h2 className={sectionTitleClass}>Personel</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {staff.map((s) => (
                <span
                  key={s._id}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-card transition hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {s.name}
                  {s.title && <span className="text-neutral-500 dark:text-neutral-400"> · {s.title}</span>}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Randevu al – stepper (1 Hizmet → 2 Tarih → 3 Saat → 4 Onay) */}
        <section id="randevu-al" className="mt-12 rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-100 p-8 shadow-soft dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900">
          <h2 className={sectionTitleClass}>Randevu al</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Hizmet seçin, tarih ve saat belirleyin, onaylayın.
          </p>

          {/* Progress bar */}
          <div className="mt-6 flex items-center gap-1">
            {([1, 2, 3, 4] as const).map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition ${
                  step <= stepProgress ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-600'
                }`}
                aria-hidden
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span>1. Hizmet</span>
            <span>2. Tarih</span>
            <span>3. Saat</span>
            <span>4. Onay</span>
          </div>

          {!selectedServiceId && (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-100">
              Önce bir hizmet seçin.
            </p>
          )}

          {selectedServiceId && (
            <>
              <div className="mt-6">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">1. Hizmet seçildi</p>
                <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                  {selectedService?.name} · {selectedService?.durationMinutes} dk
                  {selectedService?.price != null && ` · ${selectedService.price} ${selectedService.currency || '₺'}`}
                </p>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">2. Tarih seçin</p>
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  minDate={new Date()}
                  daysCount={14}
                />
              </div>

              {selectedDate && (
                <div className="mt-8">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    3. Saat seçin — {format(selectedDate, 'd MMMM yyyy')}
                  </p>
                  <div className="mt-4">
                    <TimeSlotGrid
                      slots={slotOptions}
                      selectedTime={selectedTime}
                      onSelectTime={handleSlotSelect}
                      loading={loadingSlots}
                      isBusinessOwner={false}
                    />
                  </div>
                </div>
              )}

              {selectedTime && (
                <p className="mt-6 text-sm font-medium text-primary-600 dark:text-primary-400">
                  4. Saat seçildi: {selectedTime} — Onaylamak için saate tıklayın.
                </p>
              )}
            </>
          )}
        </section>

        <ReservationModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setReserveError('');
          }}
          businessName={business.name}
          serviceName={selectedService?.name ?? ''}
          date={selectedDate ?? new Date()}
          time={selectedTime ?? ''}
          durationMinutes={selectedService?.durationMinutes}
          notes={notes}
          onNotesChange={setNotes}
          onConfirm={handleConfirmReservation}
          loading={reserveLoading}
          error={reserveError}
        />
      </div>
    </div>
  );
}

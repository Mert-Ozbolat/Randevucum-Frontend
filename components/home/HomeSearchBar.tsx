'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
} from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { Button } from '@/components/ui/Button';
import { KKTC_CITIES } from '@/lib/constants';

/** Hızlı aramada yalnızca en önemli işletme türleri */
const SERVICE_SUGGESTIONS = [
  { name: 'Kuaför', area: 'Güzellik & Bakım' },
  { name: 'Berber', area: 'Güzellik & Bakım' },
  { name: 'Güzellik Uzmanı', area: 'Güzellik & Bakım' },
  { name: 'SPA & Hamam', area: 'Güzellik & Bakım' },
  { name: 'Masaj Salonu', area: 'Güzellik & Bakım' },
  { name: 'Diş Hekimi', area: 'Sağlık' },
  { name: 'Psikolog', area: 'Sağlık' },
  { name: 'Diyetisyen', area: 'Sağlık' },
  { name: 'Fizyoterapist', area: 'Sağlık' },
  { name: 'Pilates Eğitmeni', area: 'Spor & Wellness' },
  { name: 'Fitness & Personal Trainer', area: 'Spor & Wellness' },
  { name: 'Veteriner Kliniği', area: 'Hayvan Bakımı' },
  { name: 'Oto Tamir & Mekanik Servis', area: 'Otomotiv' },
  { name: 'Restoran', area: 'Yeme & İçme' },
] as const;

const WEEKDAYS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'] as const;

export function HomeSearchBar() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [service, setService] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [openSuggest, setOpenSuggest] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));

  const suggestions = useMemo(() => {
    const q = service.trim().toLowerCase();
    if (!q) return [...SERVICE_SUGGESTIONS];
    return SERVICE_SUGGESTIONS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q)
    );
  }, [service]);

  const selectedDate = date ? parseISO(date) : null;
  const today = startOfDay(new Date());

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthCursor]);

  useEffect(() => {
    if (!openSuggest && !openCalendar) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpenSuggest(false);
        setOpenCalendar(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenSuggest(false);
        setOpenCalendar(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [openSuggest, openCalendar]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const match = SERVICE_SUGGESTIONS.find(
      (s) => s.name.toLowerCase() === service.trim().toLowerCase()
    );
    if (match) {
      params.set('area', match.area);
      params.set('profession', match.name);
    } else if (service.trim()) {
      params.set('profession', service.trim());
    }
    if (city) {
      params.set('city', city);
      sessionStorage.setItem('homeSearchCity', city);
    }
    if (date) {
      params.set('date', date);
      sessionStorage.setItem('homeSearchDate', date);
    }
    const qs = params.toString();
    router.push(qs ? `/business?${qs}` : '/business');
  };

  const dateLabel = selectedDate
    ? format(selectedDate, 'd MMMM yyyy', { locale: tr })
    : 'Tarih seç';

  return (
    <div ref={rootRef} className="relative z-[100]">
      <AnimateIn as="section" animation="slide-up" className="relative z-[100]">
      <form
        onSubmit={onSubmit}
        id="home-search"
        aria-label="Hızlı randevu arama"
        className="relative z-[100] overflow-visible rounded-[1.75rem] bg-white/90 shadow-soft ring-1 ring-neutral-200/70 backdrop-blur-xl dark:bg-neutral-900/90 dark:ring-neutral-700/70"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]" aria-hidden>
          <div className="absolute -left-10 -top-12 h-40 w-40 rounded-full bg-primary-400/20 blur-3xl" />
          <div className="absolute -right-8 bottom-0 h-36 w-36 rounded-full bg-accent-400/20 blur-3xl" />
        </div>

        <div className="relative px-5 pb-5 pt-6 sm:px-7 sm:pb-6 sm:pt-7">
          <div className="mb-5 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">
                Hızlı arama
              </p>
              <h2 className="mt-1.5 text-balance text-lg font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
                Ne arıyorsun, <span className="text-primary-600 dark:text-primary-400">nerede</span> ve{' '}
                <span className="text-primary-600 dark:text-primary-400">ne zaman</span>?
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Hizmet seç, konumu ayarla, hemen bul.
            </p>
          </div>

          <div className="relative grid gap-3 overflow-visible lg:grid-cols-[1.45fr_1fr_1fr_auto] lg:gap-0 lg:overflow-visible lg:rounded-2xl lg:bg-neutral-200/60 lg:p-px dark:lg:bg-neutral-700/60">
            {/* Service */}
            <div
              className={`relative rounded-2xl bg-white ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-700 lg:rounded-none lg:rounded-l-2xl lg:ring-0 ${
                openSuggest ? 'z-50' : 'z-30'
              }`}
            >
              <label htmlFor="home-service" className="sr-only">
                Kategori / Hizmet
              </label>
              <div className="flex min-h-[72px] items-center gap-3 px-4 py-3 sm:px-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
                  <Search className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                    Hizmet
                  </p>
                  <input
                    id="home-service"
                    type="search"
                    value={service}
                    onChange={(e) => {
                      setService(e.target.value);
                      setOpenSuggest(true);
                      setOpenCalendar(false);
                    }}
                    onFocus={() => {
                      setOpenSuggest(true);
                      setOpenCalendar(false);
                    }}
                    placeholder="Kuaför, diş, pilates…"
                    className="w-full border-0 bg-transparent p-0 text-sm font-medium text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-400 focus:ring-0 dark:text-neutral-50"
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls="home-service-suggestions"
                    aria-expanded={openSuggest}
                  />
                </div>
              </div>

              {openSuggest && suggestions.length > 0 && (
                <ul
                  id="home-service-suggestions"
                  role="listbox"
                  className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-80 overflow-auto rounded-2xl border border-neutral-200 bg-white py-1.5 shadow-soft dark:border-neutral-600 dark:bg-neutral-900"
                >
                  {suggestions.map((s) => (
                    <li key={`${s.area}-${s.name}`} role="option" aria-selected={service === s.name}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-primary-50 focus:bg-primary-50 focus:outline-none dark:hover:bg-primary-950/40 dark:focus:bg-primary-950/40"
                        onClick={() => {
                          setService(s.name);
                          setOpenSuggest(false);
                        }}
                      >
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                          {s.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          {s.area}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* City */}
            <div className="relative z-20 rounded-2xl bg-white ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-700 lg:rounded-none lg:ring-0">
              <label htmlFor="home-city" className="sr-only">
                Konum
              </label>
              <div className="flex min-h-[72px] items-center gap-3 px-4 py-3 sm:px-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400">
                  <MapPin className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                    Konum
                  </p>
                  <select
                    id="home-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onFocus={() => {
                      setOpenSuggest(false);
                      setOpenCalendar(false);
                    }}
                    className="w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-sm font-medium text-neutral-900 outline-none focus:ring-0 dark:text-neutral-50"
                  >
                    <option value="">Tüm şehirler</option>
                    {KKTC_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date — custom calendar */}
            <div
              className={`relative rounded-2xl bg-white ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-700 lg:rounded-none lg:ring-0 ${
                openCalendar ? 'z-50' : 'z-20'
              }`}
            >
              <p className="sr-only">Tarih</p>
              <button
                type="button"
                onClick={() => {
                  setOpenCalendar((v) => !v);
                  setOpenSuggest(false);
                  if (selectedDate) setMonthCursor(startOfMonth(selectedDate));
                }}
                className="flex min-h-[72px] w-full items-center gap-3 px-4 py-3 text-left sm:px-5"
                aria-expanded={openCalendar}
                aria-haspopup="dialog"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
                  <CalendarDays className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                    Tarih
                  </span>
                  <span
                    className={`block truncate text-sm font-medium ${
                      selectedDate
                        ? 'text-neutral-900 dark:text-neutral-50'
                        : 'text-neutral-400'
                    }`}
                  >
                    {dateLabel}
                  </span>
                </span>
              </button>

              {openCalendar && (
                <div
                  role="dialog"
                  aria-label="Tarih seçici"
                  className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 w-full min-w-[280px] rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft dark:border-neutral-600 dark:bg-neutral-900 sm:left-auto sm:right-0 sm:w-[320px]"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMonthCursor((m) => addMonths(m, -1))}
                      className="rounded-xl p-2 text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      aria-label="Önceki ay"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </button>
                    <p className="text-sm font-semibold capitalize text-neutral-900 dark:text-neutral-50">
                      {format(monthCursor, 'MMMM yyyy', { locale: tr })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                      className="rounded-xl p-2 text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      aria-label="Sonraki ay"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>

                  <div className="mb-1 grid grid-cols-7 gap-1">
                    {WEEKDAYS.map((d) => (
                      <span
                        key={d}
                        className="py-1 text-center text-[11px] font-semibold text-neutral-400"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day) => {
                      const disabled = isBefore(day, today);
                      const inMonth = isSameMonth(day, monthCursor);
                      const selected = selectedDate ? isSameDay(day, selectedDate) : false;
                      const isToday = isSameDay(day, today);
                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setDate(format(day, 'yyyy-MM-dd'));
                            setOpenCalendar(false);
                          }}
                          className={`h-9 rounded-xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-30 ${
                            selected
                              ? 'bg-primary-500 text-white shadow-soft'
                              : isToday
                                ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                                : inMonth
                                  ? 'text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800'
                                  : 'text-neutral-400 hover:bg-neutral-50 dark:text-neutral-500 dark:hover:bg-neutral-800/60'
                          }`}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-700">
                    <button
                      type="button"
                      className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-800 dark:hover:text-neutral-200"
                      onClick={() => {
                        setDate('');
                        setOpenCalendar(false);
                      }}
                    >
                      Temizle
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary-600 dark:text-primary-400"
                      onClick={() => {
                        setDate(format(today, 'yyyy-MM-dd'));
                        setMonthCursor(startOfMonth(today));
                        setOpenCalendar(false);
                      }}
                    >
                      Bugün
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="relative z-10 flex items-center rounded-2xl bg-white p-3 ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-700 lg:rounded-none lg:rounded-r-2xl lg:p-2.5 lg:ring-0">
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl px-6 text-base shadow-soft lg:min-w-[132px]"
              >
                Ara
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </form>
      </AnimateIn>
    </div>
  );
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { BUSINESS_SETUP_REFRESH_EVENT } from '@/lib/businessSetupRefresh';
import { useToast } from '@/components/ui/Toast';
import { reservationLocalCalendarKey } from '@/lib/reservationDate';
import {
  attachNotificationAudioUnlock,
  playBookingNotificationSound,
} from '@/lib/playNotificationSound';

export interface BusinessReservation {
  _id: string;
  date: string;
  time: string;
  endTime?: string;
  status: string;
  serviceId?: { name: string; durationMinutes?: number };
  staffId?: { _id?: string; name: string; title?: string } | string | null;
  customerId?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    attendanceStats?: {
      totalMarked?: number;
      attendedCount?: number;
      noShowCount?: number;
      attendanceRate?: number;
    };
  };
  attendance?: {
    outcome?: 'attended' | 'no_show' | null;
    markedAt?: string;
    note?: string;
  };
  reminders?: {
    customerRsvp?: 'confirmed' | 'canceled' | null;
    customerRsvpAt?: string | null;
  };
}

const POLL_VISIBLE_MS = 8_000;
const POLL_HIDDEN_MS = 20_000;

type BusinessReservationsLiveContextValue = {
  businessId: string | null;
  reservations: BusinessReservation[];
  loading: boolean;
  error: string;
  isLive: boolean;
  refresh: () => Promise<void>;
  updateReservation: (id: string, patch: Partial<BusinessReservation>) => void;
  addReservation: (reservation: BusinessReservation) => void;
};

const BusinessReservationsLiveContext = createContext<BusinessReservationsLiveContextValue | null>(
  null
);

function formatNewReservationToast(r: BusinessReservation): string {
  const customer = r.customerId
    ? `${r.customerId.firstName} ${r.customerId.lastName}`.trim()
    : 'Müşteri';
  const service = r.serviceId?.name || 'Hizmet';
  const day = reservationLocalCalendarKey(String(r.date));
  return `Yeni randevu: ${customer} — ${day} ${r.time}, ${service}`;
}

function extractBusinessIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const m = pathname.match(/\/dashboard\/business\/reservations\/([a-f0-9]{24})\/?$/i);
  return m ? m[1] : null;
}

function resolveOwnedBusinessId(
  businesses: { _id: string }[],
  pathname: string | null
): string | null {
  if (!businesses.length) return null;
  const fromPath = extractBusinessIdFromPath(pathname);
  if (fromPath && businesses.some((b) => String(b._id) === fromPath)) {
    return fromPath;
  }
  return businesses[0]?._id ?? null;
}

export function BusinessReservationsLiveProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast();
  const pathname = usePathname();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<BusinessReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLive, setIsLive] = useState(false);

  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);
  const businessIdRef = useRef<string | null>(null);

  const fetchReservations = useCallback(async (bid: string, silent = false) => {
    const res = await api.get<{ data: BusinessReservation[] }>(`/reservations/business/${bid}`);
    const list = res.data.data || [];

    if (!initialLoadDoneRef.current) {
      knownIdsRef.current = new Set(list.map((r) => r._id));
      initialLoadDoneRef.current = true;
      setReservations(list);
      return list;
    }

    const newOnes = list.filter((r) => !knownIdsRef.current.has(r._id));
    if (newOnes.length > 0) {
      for (const r of newOnes) knownIdsRef.current.add(r._id);

      const tabVisible = typeof document !== 'undefined' && document.visibilityState === 'visible';
      if (tabVisible) {
        playBookingNotificationSound();
        if (newOnes.length === 1) {
          addToast('info', formatNewReservationToast(newOnes[0]));
        } else {
          addToast('info', `${newOnes.length} yeni randevu geldi.`);
        }
      } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const body =
          newOnes.length === 1
            ? formatNewReservationToast(newOnes[0])
            : `${newOnes.length} yeni randevu`;
        new Notification('Yeni randevu', { body, tag: 'new-reservation' });
      }
    }

    for (const r of list) knownIdsRef.current.add(r._id);
    setReservations(list);
    return list;
  }, [addToast]);

  const refresh = useCallback(async () => {
    const bid = businessIdRef.current;
    if (!bid) return;
    await fetchReservations(bid, true);
  }, [fetchReservations]);

  const updateReservation = useCallback((id: string, patch: Partial<BusinessReservation>) => {
    setReservations((prev) => prev.map((r) => (r._id === id ? { ...r, ...patch } : r)));
  }, []);

  const addReservation = useCallback((reservation: BusinessReservation) => {
    knownIdsRef.current.add(reservation._id);
    setReservations((prev) => {
      const next = [...prev, reservation];
      next.sort((a, b) => {
        const da = String(a.date);
        const db = String(b.date);
        if (da !== db) return da.localeCompare(db);
        return (a.time || '').localeCompare(b.time || '');
      });
      return next;
    });
  }, []);

  const loadBusiness = useCallback(async () => {
    try {
      const res = await fetchMyBusinesses<{ data: { _id: string }[] }>();
      const list = res.data.data || [];
      const bid = resolveOwnedBusinessId(list, pathname);
      if (businessIdRef.current !== bid) {
        initialLoadDoneRef.current = false;
        knownIdsRef.current = new Set();
      }
      setBusinessId(bid);
      businessIdRef.current = bid;
      if (!bid) {
        setReservations([]);
        knownIdsRef.current = new Set();
        initialLoadDoneRef.current = false;
        return null;
      }
      return fetchReservations(bid);
    } catch {
      setError('Randevular yüklenemedi.');
      return null;
    }
  }, [fetchReservations, pathname]);

  useEffect(() => {
    attachNotificationAudioUnlock();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void loadBusiness().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadBusiness]);

  useEffect(() => {
    const onRefresh = () => {
      void loadBusiness();
    };
    window.addEventListener(BUSINESS_SETUP_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(BUSINESS_SETUP_REFRESH_EVENT, onRefresh);
  }, [loadBusiness]);

  useEffect(() => {
    const bid = businessId;
    if (!bid) {
      setIsLive(false);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const schedule = () => {
      const delay = document.visibilityState === 'visible' ? POLL_VISIBLE_MS : POLL_HIDDEN_MS;
      timer = window.setTimeout(async () => {
        if (cancelled) return;
        try {
          await fetchReservations(bid, true);
          if (!cancelled) setError('');
        } catch {
          if (!cancelled) setError('Canlı güncelleme kesildi, yeniden deneniyor…');
        }
        if (!cancelled) schedule();
      }, delay);
    };

    setIsLive(true);
    schedule();

    const onVisibility = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      if (!cancelled) schedule();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      setIsLive(false);
      if (timer !== undefined) window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [businessId, fetchReservations]);

  return (
    <BusinessReservationsLiveContext.Provider
      value={{
        businessId,
        reservations,
        loading,
        error,
        isLive,
        refresh,
        updateReservation,
        addReservation,
      }}
    >
      {children}
    </BusinessReservationsLiveContext.Provider>
  );
}

export function useBusinessReservationsLive(): BusinessReservationsLiveContextValue {
  const ctx = useContext(BusinessReservationsLiveContext);
  if (!ctx) {
    throw new Error('useBusinessReservationsLive must be used within BusinessReservationsLiveProvider');
  }
  return ctx;
}

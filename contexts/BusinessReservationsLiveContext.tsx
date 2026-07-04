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
  customerId?: { firstName: string; lastName: string; email?: string; phone?: string };
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

export function BusinessReservationsLiveProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast();
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

  const loadBusiness = useCallback(async () => {
    try {
      const res = await fetchMyBusinesses<{ data: { _id: string }[] }>();
      const bid = res.data.data?.[0]?._id ?? null;
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
  }, [fetchReservations]);

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

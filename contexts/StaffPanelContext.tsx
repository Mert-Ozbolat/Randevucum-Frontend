'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { isBusinessOwner } from '@/lib/auth';

export type StaffMeRow = {
  _id: string;
  canViewOwnReservations?: boolean;
  businessId?: { _id?: string; name?: string };
  name?: string;
};

type StaffPanelContextValue = {
  staffRows: StaffMeRow[];
  staffLoading: boolean;
  canViewStaffPanel: boolean;
  refreshStaffMe: () => void;
};

const StaffPanelContext = createContext<StaffPanelContextValue>({
  staffRows: [],
  staffLoading: true,
  canViewStaffPanel: false,
  refreshStaffMe: () => {},
});

export function StaffPanelProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const [staffRows, setStaffRows] = useState<StaffMeRow[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);

  const load = useCallback(() => {
    if (!token || !user || isBusinessOwner(user)) {
      setStaffRows([]);
      setStaffLoading(false);
      return;
    }
    setStaffLoading(true);
    api
      .get<{ data: StaffMeRow[] }>('/staff/me')
      .then((res) => setStaffRows(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setStaffRows([]))
      .finally(() => setStaffLoading(false));
  }, [token, user]);

  useEffect(() => {
    load();
  }, [load]);

  const canViewStaffPanel = useMemo(
    () => Boolean(user && !isBusinessOwner(user) && staffRows.some((s) => s.canViewOwnReservations)),
    [user, staffRows]
  );

  const value = useMemo(
    () => ({
      staffRows,
      staffLoading,
      canViewStaffPanel,
      refreshStaffMe: load,
    }),
    [staffRows, staffLoading, canViewStaffPanel, load]
  );

  return <StaffPanelContext.Provider value={value}>{children}</StaffPanelContext.Provider>;
}

export function useStaffPanel() {
  return useContext(StaffPanelContext);
}

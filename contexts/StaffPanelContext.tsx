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
  phone?: string | null;
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

  const canViewStaffPanel = useMemo(() => {
    if (!user || isBusinessOwner(user) || staffLoading) return false;
    return staffRows.some((s) => {
      if (s.canViewOwnReservations !== true) return false;
      const bid =
        typeof s.businessId === 'string'
          ? s.businessId
          : s.businessId && typeof s.businessId === 'object'
            ? s.businessId._id
            : null;
      return Boolean(bid);
    });
  }, [user, staffRows, staffLoading]);

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

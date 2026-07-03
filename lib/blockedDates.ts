import { api } from '@/lib/api';
import { format, addDays, startOfDay } from 'date-fns';

export async function fetchBlockedDates(params: {
  businessId: string;
  serviceId: string;
  staffId?: string | null;
  daysCount?: number;
}): Promise<Set<string>> {
  const from = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const to = format(addDays(startOfDay(new Date()), params.daysCount ?? 60), 'yyyy-MM-dd');

  const res = await api.get<{
    data: { unavailable?: string[] };
  }>('/reservations/blocked-dates', {
    params: {
      businessId: params.businessId,
      serviceId: params.serviceId,
      staffId: params.staffId || undefined,
      from,
      to,
    },
  });

  return new Set(res.data.data?.unavailable || []);
}

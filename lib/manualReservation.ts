import { api } from '@/lib/api';

export interface BusinessCustomerSearchResult {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface ManualReservationPayload {
  serviceId: string;
  staffId?: string;
  date: string;
  time: string;
  notes?: string;
  customerId?: string;
  guestName?: string;
  customerPhone?: string;
}

export async function searchBusinessCustomers(
  businessId: string,
  query: string
): Promise<BusinessCustomerSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const { data } = await api.get<{ data: BusinessCustomerSearchResult[] }>(
    `/reservations/business/${businessId}/customers/search`,
    { params: { q } }
  );
  return data.data || [];
}

export async function createManualReservation(
  businessId: string,
  payload: ManualReservationPayload
) {
  const { data } = await api.post<{ data: { reservation: unknown } }>(
    `/reservations/business/${businessId}/manual`,
    payload
  );
  return data.data.reservation;
}

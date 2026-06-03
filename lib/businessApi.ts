import { api } from '@/lib/api';

/** İşletme paneli: yalnızca giriş yapan sahibin işletmeleri */
export function fetchMyBusinesses<T = { data: unknown[] }>() {
  return api.get<T>('/business', { params: { mine: 'true' } });
}

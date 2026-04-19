import { api } from '@/lib/api';
import { getPresenceSessionId } from '@/lib/presenceSession';

export type HomeStatsPayload = {
  activeUsers: number;
  todayReservations: number;
  openBusinesses: number;
  activeWindowMinutes: number;
  updatedAt: string;
};

export async function fetchHomeStats(): Promise<HomeStatsPayload | null> {
  try {
    const res = await api.get<{ data: HomeStatsPayload }>('/stats/home');
    return res.data.data ?? null;
  } catch {
    return null;
  }
}

/** Sunucuya “buradayım” ping’i — aktif kullanıcı sayısı için (5 dk pencere). */
export async function pingPresence(): Promise<void> {
  const id = getPresenceSessionId();
  if (!id) return;
  await api.post('/stats/presence', {}, { headers: { 'X-Presence-Id': id } });
}

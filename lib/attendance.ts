export interface AttendanceStats {
  totalMarked?: number;
  attendedCount?: number;
  noShowCount?: number;
  attendanceRate?: number;
  warningCount?: number;
  lastWarningAt?: string | null;
  lastNoShowAt?: string | null;
}

export type AttendanceWarningLevel = 'none' | 'warning' | 'critical';

export function getAttendanceWarningLevel(stats?: AttendanceStats | null): AttendanceWarningLevel {
  if (!stats || (stats.totalMarked ?? 0) < 1) return 'none';
  const rate = stats.attendanceRate ?? 100;
  const noShows = stats.noShowCount ?? 0;
  const total = stats.totalMarked ?? 0;

  if (total >= 3 && rate < 50) return 'critical';
  if (noShows >= 2 && rate < 70) return 'warning';
  if (total >= 2 && rate < 60) return 'warning';
  return 'none';
}

export function getAttendanceWarningMessage(stats?: AttendanceStats | null): string | null {
  const level = getAttendanceWarningLevel(stats);
  if (level === 'none' || !stats) return null;

  const rate = stats.attendanceRate ?? 100;
  const noShows = stats.noShowCount ?? 0;

  if (level === 'critical') {
    return `Randevularınıza katılım oranınız %${rate} (${noShows} kez gelmediniz). Gelecekteki randevularınız iptal edilebilir. Lütfen randevularınıza zamanında gelin veya önceden iptal edin.`;
  }
  return `Randevularınıza katılım oranınız %${rate}. Randevunuza gelemeyecekseniz lütfen önceden iptal edin.`;
}

export function formatAttendanceRate(stats?: AttendanceStats | null): string {
  if (!stats || (stats.totalMarked ?? 0) === 0) return '—';
  return `%${stats.attendanceRate ?? 100}`;
}

export function attendanceRateColor(rate: number): string {
  if (rate >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (rate >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

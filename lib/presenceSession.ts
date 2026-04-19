const STORAGE_KEY = 'randevucum_presence_id';

/** Tarayıcı başına sabit oturum kimliği (anonim aktif kullanıcı sayımı için). */
export function getPresenceSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id || id.length < 8) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `p-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `p-${Date.now()}`;
  }
}

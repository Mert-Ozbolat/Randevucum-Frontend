const STORAGE_KEY = 'randevucum-business-setup-published';

export const BUSINESS_SETUP_PUBLISHED_EVENT = 'business-setup-published';

export function isBusinessSetupPublishedCached(userId: string | undefined): boolean {
  if (typeof window === 'undefined' || !userId) return false;
  return sessionStorage.getItem(STORAGE_KEY) === userId;
}

export function markBusinessSetupPublished(userId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, userId);
  window.dispatchEvent(new CustomEvent(BUSINESS_SETUP_PUBLISHED_EVENT));
}

export function clearBusinessSetupPublishedCache(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

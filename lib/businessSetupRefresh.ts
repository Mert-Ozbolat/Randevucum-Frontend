/** Kaydet sonrası kurulum şeridini yenilemek için tarayıcı olayı */

export const BUSINESS_SETUP_REFRESH_EVENT = 'business-setup-refresh';

export function dispatchBusinessSetupRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(BUSINESS_SETUP_REFRESH_EVENT));
}

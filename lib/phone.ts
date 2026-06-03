export function phoneDigitsOnly(input: string): string {
  return String(input || '').replace(/\D/g, '');
}

/** Türkiye cep: 0 5xx xxx xx xx görünümü */
export function formatTrMobile(digitsRaw: string): string {
  const d = phoneDigitsOnly(digitsRaw);
  let x = d;
  if (x.startsWith('90')) x = x.slice(2);
  if (x.startsWith('0')) x = x.slice(1);
  const m = x.slice(0, 10);
  const a = m.slice(0, 3);
  const b = m.slice(3, 6);
  const c = m.slice(6, 8);
  const e = m.slice(8, 10);
  if (!a) return '';
  if (m.length <= 3) return `0${a}`;
  if (m.length <= 6) return `0${a} ${b}`;
  if (m.length <= 8) return `0${a} ${b} ${c}`;
  return `0${a} ${b} ${c} ${e}`;
}

export function phoneInputFromStored(stored?: string | null): string {
  if (!stored?.trim()) return '';
  return formatTrMobile(stored);
}

/** Ekranda gösterim (+905… veya 05… → 0 5xx xxx xx xx) */
export function formatPhoneDisplay(stored?: string | null): string {
  return phoneInputFromStored(stored);
}

/** tel: link için sadece rakamlar (+90…) */
export function phoneTelHref(stored?: string | null): string {
  const d = phoneDigitsOnly(stored || '');
  if (!d) return '';
  if (d.startsWith('90')) return `+${d}`;
  if (d.startsWith('0')) return `+90${d.slice(1)}`;
  if (d.length === 10 && d.startsWith('5')) return `+90${d}`;
  return d.startsWith('+') ? d : `+${d}`;
}

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

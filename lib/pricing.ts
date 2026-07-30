export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly' | 'custom';

export type PublicPlan = {
  priceId: string;
  label: string;
  planKey: 'pro';
  displayAmount: number;
  displayPrice: string;
  intervalLabel?: string;
  billingPeriod?: BillingPeriod;
};

export const FALLBACK_PLANS: PublicPlan[] = [
  {
    priceId: 'fallback-monthly',
    label: 'Aylık',
    planKey: 'pro',
    displayAmount: 999,
    displayPrice: '₺999',
    intervalLabel: 'ay',
    billingPeriod: 'monthly',
  },
  {
    priceId: 'fallback-quarterly',
    label: '3 Aylık',
    planKey: 'pro',
    displayAmount: 2700,
    displayPrice: '₺2.700',
    intervalLabel: '3 ay',
    billingPeriod: 'quarterly',
  },
  {
    priceId: 'fallback-yearly',
    label: 'Yıllık',
    planKey: 'pro',
    displayAmount: 9600,
    displayPrice: '₺9.600',
    intervalLabel: 'yıl',
    billingPeriod: 'yearly',
  },
];

const MONTHLY_BASE = 999;

export function planBadge(plan: PublicPlan): string | null {
  if (plan.billingPeriod === 'quarterly') return 'En avantajlı';
  if (plan.billingPeriod === 'yearly') return 'Yıllık tasarruf';
  return null;
}

export function monthlyEquivalent(plan: PublicPlan): number | null {
  if (!plan.displayAmount) return null;
  if (plan.billingPeriod === 'quarterly') return Math.round(plan.displayAmount / 3);
  if (plan.billingPeriod === 'yearly') return Math.round(plan.displayAmount / 12);
  return null;
}

export function savingsPercent(plan: PublicPlan): number | null {
  const equiv = monthlyEquivalent(plan);
  if (!equiv || equiv >= MONTHLY_BASE) return null;
  return Math.round(((MONTHLY_BASE - equiv) / MONTHLY_BASE) * 100);
}

export function formatTry(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function planDescription(plan: PublicPlan): string {
  if (plan.billingPeriod === 'yearly') return 'Yıllık ödeme · otomatik yenileme';
  if (plan.billingPeriod === 'quarterly') return '3 ayda bir ödeme · otomatik yenileme';
  return 'Aylık ödeme · otomatik yenileme';
}

export function isCheckoutPlan(plan: PublicPlan): boolean {
  return Boolean(plan.priceId && !plan.priceId.startsWith('fallback-'));
}

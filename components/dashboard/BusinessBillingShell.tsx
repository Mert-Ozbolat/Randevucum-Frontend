'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fetchMyBusinesses } from '@/lib/businessApi';
import { BillingNoticeBanner } from '@/components/dashboard/BillingNoticeBanner';
import { TrialRenewalModal } from '@/components/dashboard/TrialRenewalModal';

export type BillingStatus = {
  businessId: string;
  _id?: string;
  isActive?: boolean;
  canAcceptBookings?: boolean;
  isTrial?: boolean;
  trialExpired?: boolean;
  needsRenewal?: boolean;
  inGracePeriod?: boolean;
  billingNotice?: string | null;
  billingSuspended?: boolean;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string | null;
  endDate?: string;
  planKey?: string;
};

type StripeConfig = {
  checkoutEnabled?: boolean;
  plans?: { priceId: string; label: string }[];
};

type Props = {
  children: React.ReactNode;
};

export function BusinessBillingShell({ children }: Props) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [trialModalDismissed, setTrialModalDismissed] = useState(false);

  const loadBilling = useCallback(async (bid: string) => {
    const res = await api.get<{ data: BillingStatus }>(`/subscription/status/${bid}`);
    setBilling(res.data.data);
    return res.data.data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      fetchMyBusinesses<{ data: { _id: string }[] }>()
      .then(async (res) => {
        const bid = res.data.data?.[0]?._id;
        if (!bid || cancelled) return;
        setBusinessId(bid);
        await loadBilling(bid);
        try {
          const cfg = await api.get<{ data: StripeConfig }>('/payments/stripe/config');
          if (!cancelled) setStripeConfig(cfg.data.data);
        } catch {
          if (!cancelled) setStripeConfig({ checkoutEnabled: false });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loadBilling]);

  const openBillingPortal = async () => {
    if (!businessId) return;
    setPortalLoading(true);
    try {
      const res = await api.post<{ data: { url?: string } }>('/payments/stripe/billing-portal', { businessId });
      const url = res.data.data?.url;
      if (url) window.location.href = url;
    } catch {
      // toast handled by caller pages if needed
    } finally {
      setPortalLoading(false);
    }
  };

  const showTrialModal =
    Boolean(billing?.trialExpired && billing?.needsRenewal && !billing?.billingSuspended && !trialModalDismissed);

  const showBillingNotice = Boolean(billing?.billingNotice && !billing?.billingSuspended);

  return (
    <>
      {showBillingNotice && billing?.billingNotice && (
        <BillingNoticeBanner
          message={billing.billingNotice}
          inGracePeriod={billing.inGracePeriod}
          onOpenPortal={billing.stripeSubscriptionId ? () => void openBillingPortal() : undefined}
          portalLoading={portalLoading}
        />
      )}
      {children}
      {businessId && (
        <TrialRenewalModal
          open={showTrialModal}
          businessId={businessId}
          endDate={billing?.endDate}
          plans={stripeConfig?.plans}
          checkoutEnabled={stripeConfig?.checkoutEnabled}
          onDismiss={() => setTrialModalDismissed(true)}
        />
      )}
    </>
  );
}

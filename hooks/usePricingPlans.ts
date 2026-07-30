'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FALLBACK_PLANS, type PublicPlan } from '@/lib/pricing';

const DEFAULT_TRIAL_DAYS = 30;

export function usePricingPlans() {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [trialDays, setTrialDays] = useState(DEFAULT_TRIAL_DAYS);
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get<{ data: { plans: PublicPlan[]; trialDays?: number } }>('/payments/stripe/plans')
      .then((res) => {
        if (cancelled) return;
        const list = res.data.data?.plans || [];
        setPlans(list.length > 0 ? list : FALLBACK_PLANS);
        setFromApi(list.length > 0);
        if (res.data.data?.trialDays) setTrialDays(res.data.data.trialDays);
      })
      .catch(() => {
        if (!cancelled) {
          setPlans(FALLBACK_PLANS);
          setFromApi(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { plans, trialDays, loading, fromApi };
}

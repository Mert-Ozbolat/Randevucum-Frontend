'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isBusinessOwner } from '@/lib/auth';
import { isBusinessSetupPublishedCached, markBusinessSetupPublished } from '@/lib/businessSetupCache';
import {
  businessOwnerLandingPath,
  fetchBusinessSetupStatus,
  isBusinessSetupPublished,
} from '@/lib/businessOwnerRedirect';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    if (isBusinessOwner(user)) {
      if (isBusinessSetupPublishedCached(user._id)) {
        router.replace('/dashboard/business');
        return;
      }
      void fetchBusinessSetupStatus().then((status) => {
        if (isBusinessSetupPublished(status)) markBusinessSetupPublished(user._id);
        router.replace(businessOwnerLandingPath(status));
      });
    } else {
      router.replace('/dashboard/customer/reservations');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  );
}

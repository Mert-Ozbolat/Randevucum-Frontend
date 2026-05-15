'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isBusinessOwner } from '@/lib/auth';
import { businessOwnerLandingPath, fetchBusinessSetupStatus } from '@/lib/businessOwnerRedirect';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    if (isBusinessOwner(user)) {
      void fetchBusinessSetupStatus().then((status) => {
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

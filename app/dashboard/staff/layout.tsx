'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffPanel } from '@/contexts/StaffPanelContext';
import { useAuthStore } from '@/store/authStore';
import { isBusinessOwner } from '@/lib/auth';

export default function StaffSectionLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { canViewStaffPanel, staffLoading } = useStaffPanel();

  useEffect(() => {
    if (staffLoading || !user) return;
    if (isBusinessOwner(user)) {
      router.replace('/dashboard/business');
      return;
    }
    if (!canViewStaffPanel) {
      router.replace('/dashboard/customer/reservations');
    }
  }, [user, canViewStaffPanel, staffLoading, router]);

  if (staffLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (isBusinessOwner(user) || !canViewStaffPanel) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

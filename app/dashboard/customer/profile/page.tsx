'use client';

import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

export default function CustomerProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Profil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Hesap bilgileri</CardTitle>
        </CardHeader>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-neutral-500">Ad Soyad</dt>
            <dd className="font-medium text-neutral-900">
              {user.firstName} {user.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">E-posta</dt>
            <dd className="font-medium text-neutral-900">{user.email}</dd>
          </div>
          {user.phone && (
            <div>
              <dt className="text-neutral-500">Telefon</dt>
              <dd className="font-medium text-neutral-900">{user.phone}</dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  );
}

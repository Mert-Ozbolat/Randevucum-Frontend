'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Phone } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { isBusinessOwner } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useStaffPanel } from '@/contexts/StaffPanelContext';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { phoneDigitsOnly } from '@/lib/phone';

export function staffNeedsPhone(
  staffRows: { canViewOwnReservations?: boolean; phone?: string | null }[]
): boolean {
  return staffRows.some(
    (s) => s.canViewOwnReservations === true && !(s.phone && String(s.phone).trim())
  );
}

export function StaffPhoneRequiredGate() {
  const user = useAuthStore((s) => s.user);
  const { staffRows, staffLoading, canViewStaffPanel, refreshStaffMe } = useStaffPanel();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const needsPhone = useMemo(() => {
    if (!user || isBusinessOwner(user) || !canViewStaffPanel) return false;
    return staffNeedsPhone(staffRows);
  }, [user, canViewStaffPanel, staffRows]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!needsPhone) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [needsPhone]);

  const handleSave = async () => {
    setError('');
    const digits = phoneDigitsOnly(phone);
    if (digits.length < 10) {
      setError('Geçerli bir telefon numarası girin.');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/staff/me/phone', { phone });
      refreshStaffMe();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || staffLoading || !needsPhone) return null;

  const businessNames = staffRows
    .filter((s) => s.canViewOwnReservations)
    .map((s) => s.businessId?.name || s.name)
    .filter(Boolean)
    .join(' · ');

  return createPortal(
    <div className="fixed inset-0 z-[250] flex min-h-[100dvh] min-w-full items-center justify-center p-4">
      <div className="absolute inset-0 min-h-[100dvh] w-full bg-neutral-950/70 backdrop-blur-md" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-phone-title"
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-3xl border border-neutral-300 bg-white shadow-2xl ring-1 ring-black/5 dark:border-neutral-600 dark:bg-neutral-900 dark:ring-white/10"
      >
        <div className="border-b border-neutral-200 bg-primary-50 px-5 py-5 dark:border-neutral-700 dark:bg-primary-950/40">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-sm">
              <Phone className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <h2 id="staff-phone-title" className="text-lg font-bold text-neutral-900 dark:text-white">
                Telefon numaranız gerekli
              </h2>
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">
                Randevu bildirimleri için WhatsApp numaranızı ekleyin.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          {businessNames && (
            <p className="rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              Personel kaydı: <span className="font-semibold text-neutral-800 dark:text-neutral-100">{businessNames}</span>
            </p>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          <PhoneInput
            label="WhatsApp telefon numarası"
            value={phone}
            onChange={setPhone}
            required
            hint="Size atanan randevular için bildirimler bu numaraya gönderilir."
          />

          <Button type="button" className="w-full" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Kaydet ve devam et'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

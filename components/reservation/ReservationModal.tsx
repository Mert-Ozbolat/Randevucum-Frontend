'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { phoneInputFromStored } from '@/lib/phone';
import { CUSTOMER_CANCEL_POLICY_NOTICE } from '@/lib/reservationFilters';

export interface ReservationConfirmPayload {
  phone?: string;
  guestName?: string;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
  serviceName: string;
  /** Seçilen personel adı (yoksa gösterilmez) */
  staffLabel?: string;
  date: Date;
  time: string;
  durationMinutes?: number;
  notes: string;
  onNotesChange: (value: string) => void;
  phone?: string;
  onPhoneChange?: (value: string) => void;
  requirePhone?: boolean;
  /** Oturum açmadan hızlı randevu */
  quickBooking?: boolean;
  loginHref?: string;
  onConfirm: (payload?: ReservationConfirmPayload) => void;
  loading?: boolean;
  error?: string;
}

export function ReservationModal({
  isOpen,
  onClose,
  businessName,
  serviceName,
  staffLabel,
  date,
  time,
  durationMinutes,
  notes,
  onNotesChange,
  phone,
  onPhoneChange,
  requirePhone = false,
  quickBooking = false,
  loginHref,
  onConfirm,
  loading = false,
  error,
}: ReservationModalProps) {
  const showPhone = quickBooking || Boolean(requirePhone || !String(phone || '').trim());
  const [localPhone, setLocalPhone] = useState<string>(phone || '');
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    setLocalPhone(phoneInputFromStored(phone) || phone || '');
  }, [phone, isOpen]);

  useEffect(() => {
    if (!isOpen) setGuestName('');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      phone: showPhone ? localPhone : undefined,
      guestName: quickBooking ? guestName.trim() : undefined,
    });
  };

  const dateLabelMobile = format(date, 'd MMM yyyy, EEE', { locale: tr });
  const dateLabelDesktop = format(date, 'd MMMM yyyy, EEEE', { locale: tr });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
    >
      <div
        className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative flex max-h-[min(92dvh,100%)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-soft animate-slide-up dark:border-neutral-700 dark:bg-neutral-900 sm:max-h-[90vh] sm:rounded-2xl">
        {/* Sabit üst başlık */}
        <div className="shrink-0 border-b border-neutral-200/80 px-4 pb-3 pt-4 dark:border-neutral-700/80 sm:px-6 sm:pb-4 sm:pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2
                id="reservation-modal-title"
                className="text-lg font-bold text-neutral-900 dark:text-neutral-50 sm:text-xl"
              >
                {quickBooking ? 'Hızlı randevu' : 'Randevu özeti'}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-sm">
                {quickBooking
                  ? 'Adınız ve WhatsApp numaranızla hesap açmadan randevunuzu oluşturun.'
                  : 'Bilgileri kontrol edip randevunuzu oluşturun.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {quickBooking && loginHref && (
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 sm:text-sm">
              Hesabınız var mı?{' '}
              <Link
                href={loginHref}
                className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
              >
                Giriş yapın
              </Link>
            </p>
          )}
        </div>

        {/* Kaydırılabilir içerik */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-3.5 dark:border-neutral-700 dark:bg-neutral-800/60 sm:p-4">
            {businessName && (
              <p className="break-words text-sm text-neutral-900 dark:text-neutral-50 sm:text-base">
                <span className="font-bold">İşletme:</span> {businessName}
              </p>
            )}
            <p className="mt-2 break-words text-sm text-neutral-900 dark:text-neutral-50 sm:text-base">
              <span className="font-bold">Hizmet:</span> {serviceName}
              {durationMinutes != null && (
                <span className="text-neutral-600 dark:text-neutral-300"> ({durationMinutes} dk)</span>
              )}
            </p>
            <p className="mt-2 text-sm text-neutral-900 dark:text-neutral-50 sm:text-base">
              <span className="font-bold">Tarih:</span>{' '}
              <span className="sm:hidden">{dateLabelMobile}</span>
              <span className="hidden sm:inline">{dateLabelDesktop}</span>
            </p>
            <p className="mt-2 text-sm text-neutral-900 dark:text-neutral-50 sm:text-base">
              <span className="font-bold">Saat:</span> {time}
            </p>
            {staffLabel ? (
              <p className="mt-2 break-words text-sm text-neutral-900 dark:text-neutral-50 sm:text-base">
                <span className="font-bold">Personel:</span> {staffLabel}
              </p>
            ) : null}
          </div>

          <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100 sm:mt-4 sm:px-4 sm:text-sm">
            {CUSTOMER_CANCEL_POLICY_NOTICE}
          </div>

          <div className="mt-4 space-y-4">
            {quickBooking && (
              <Input
                label="Ad soyad"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Örn. Ayşe Yılmaz"
                required
                autoComplete="name"
              />
            )}
            {showPhone && (
              <PhoneInput
                label="WhatsApp telefon"
                value={localPhone}
                onChange={(v) => {
                  setLocalPhone(v);
                  onPhoneChange?.(v);
                }}
                required={quickBooking || requirePhone}
                hint={
                  quickBooking
                    ? 'Onay ve hatırlatmalar bu numaraya WhatsApp ile gönderilir.'
                    : 'İlk randevunuzda istenir; sonraki randevularda tekrar sorulmaz.'
                }
              />
            )}
            <div>
              <label
                htmlFor="reservation-notes"
                className="block text-sm font-medium text-neutral-900 dark:text-neutral-50"
              >
                Not (isteğe bağlı)
              </label>
              <textarea
                id="reservation-notes"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Randevu notu..."
                rows={2}
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500 sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Sabit alt butonlar — mobilde tam genişlik */}
        <div className="shrink-0 border-t border-neutral-200/80 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-neutral-700/80 dark:bg-neutral-900 sm:px-6 sm:py-4">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:gap-3">
            <Button variant="danger" className="w-full sm:flex-1" onClick={onClose}>
              İptal
            </Button>
            <Button
              className="w-full py-3 text-base font-semibold sm:flex-[1.5]"
              loading={loading}
              onClick={handleConfirm}
            >
              {quickBooking ? 'Hızlı randevu al' : 'Randevuyu oluştur'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
  serviceName: string;
  /** Boş dizi yoksa: seçilen personel adı veya "Farketmez" metni */
  staffLabel?: string;
  date: Date;
  time: string;
  durationMinutes?: number;
  notes: string;
  onNotesChange: (value: string) => void;
  phone?: string;
  onPhoneChange?: (value: string) => void;
  requirePhone?: boolean;
  onConfirm: () => void;
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
  onConfirm,
  loading = false,
  error,
}: ReservationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
    >
      <div
        className="absolute inset-0 bg-neutral-900 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft animate-slide-up">
        <h2 id="reservation-modal-title" className="text-xl font-bold text-neutral-900">
          Randevu Onayı
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Lütfen bilgileri kontrol edip onaylayın.
        </p>

        {/* Bilgi alanları kutu içinde */}
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-100 p-4">
          {businessName && (
            <p className="text-neutral-900">
              <span className="font-bold">İşletme:</span> {businessName}
            </p>
          )}
          <p className="mt-2 text-neutral-900">
            <span className="font-bold">Hizmet:</span> {serviceName}
            {durationMinutes != null && (
              <span className="text-neutral-600"> ({durationMinutes} dk)</span>
            )}
          </p>
          <p className="mt-2 text-neutral-900">
            <span className="font-bold">Tarih:</span>{' '}
            {format(date, 'd MMMM yyyy, EEEE', { locale: tr })}
          </p>
          <p className="mt-2 text-neutral-900">
            <span className="font-bold">Saat:</span> {time}
          </p>
          {staffLabel ? (
            <p className="mt-2 text-neutral-900">
              <span className="font-bold">Personel:</span> {staffLabel}
            </p>
          ) : null}
        </div>

        <div className="mt-4">
          {requirePhone && onPhoneChange && (
            <div className="mb-4">
              <Input
                label="Telefon (WhatsApp hatırlatmaları için)"
                type="tel"
                autoComplete="tel"
                placeholder="05xx xxx xx xx"
                value={phone || ''}
                onChange={(e) => onPhoneChange(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-neutral-500">
                Otomatik formatlanır. İlk randevunuzda istenir; sonraki randevularda tekrar sorulmaz.
              </p>
            </div>
          )}
          <label
            htmlFor="reservation-notes"
            className="block text-sm font-medium text-neutral-900"
          >
            Not (isteğe bağlı)
          </label>
          <textarea
            id="reservation-notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Randevu notu..."
            rows={2}
            className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <Button
            variant="danger"
            className="flex-1"
            onClick={onClose}
          >
            İptal
          </Button>
          <Button
            className="flex-[1.5] py-3 text-base font-semibold"
            loading={loading}
            onClick={onConfirm}
          >
            Rezervasyonu Onayla
          </Button>
        </div>
      </div>
    </div>
  );
}

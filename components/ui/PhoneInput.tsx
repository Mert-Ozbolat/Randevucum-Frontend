'use client';

import { Input } from '@/components/ui/Input';
import { formatTrMobile, phoneDigitsOnly } from '@/lib/phone';

/** Türkiye cep — tüm formlarda aynı görünüm */
export const TR_PHONE_PLACEHOLDER = '0 5xx xxx xx xx';

type PhoneInputProps = {
  label?: string;
  value: string;
  onChange: (formatted: string) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  /** 0 + 10 hane (varsayılan 11 rakam girişi) */
  maxDigitLength?: number;
  autoComplete?: string;
  disabled?: boolean;
};

export function PhoneInput({
  label,
  value,
  onChange,
  required,
  error,
  hint,
  maxDigitLength = 11,
  autoComplete = 'tel',
  disabled,
}: PhoneInputProps) {
  return (
    <div className="w-full">
      <Input
        label={label}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        placeholder={TR_PHONE_PLACEHOLDER}
        required={required}
        error={error}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const digits = phoneDigitsOnly(e.target.value);
          if (digits.length <= maxDigitLength) onChange(formatTrMobile(digits));
        }}
      />
      {hint ? <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p> : null}
    </div>
  );
}

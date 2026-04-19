import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 shadow-card transition placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 disabled:bg-neutral-100 disabled:text-neutral-500 dark:border-neutral-500 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/20 dark:disabled:bg-neutral-900 dark:disabled:text-neutral-500 ${error ? 'border-red-500 dark:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';

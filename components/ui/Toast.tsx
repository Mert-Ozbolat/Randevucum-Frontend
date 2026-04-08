'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-soft animate-slide-up ${
              t.type === 'success'
                ? 'border-primary-200 bg-primary-50 text-primary-800'
                : t.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-neutral-200 bg-white text-neutral-800'
            }`}
          >
            {t.type === 'success' && (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-600" strokeWidth={2} aria-hidden />
            )}
            {t.type === 'error' && (
              <CircleAlert className="h-5 w-5 shrink-0 text-red-600" strokeWidth={2} aria-hidden />
            )}
            {t.type === 'info' && (
              <Info className="h-5 w-5 shrink-0 text-neutral-500" strokeWidth={2} aria-hidden />
            )}
            <span className="flex-1 text-sm font-medium">{t.message}</span>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="rounded p-0.5 text-neutral-400 hover:bg-black/5 hover:text-neutral-600 dark:hover:bg-white/10"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { addToast: () => {}, toasts: [], removeToast: () => {} };
  return ctx;
}

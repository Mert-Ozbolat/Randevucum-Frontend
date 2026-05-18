import axios, { AxiosError } from 'axios';
import { clearAuth } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

const isBrowser = typeof window !== 'undefined';

function isPublicAuthPage(): boolean {
  if (!isBrowser) return false;
  const path = window.location.pathname;
  return path === '/login' || path === '/register' || path.startsWith('/login/') || path.startsWith('/register/');
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (isBrowser) {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    if (isBrowser && err.response?.status === 401) {
      const url = String(err.config?.url || '');
      const isAuthAttempt = ['/auth/login', '/auth/register', '/auth/google'].some((p) => url.includes(p));
      if (!isAuthAttempt) {
        clearAuth();
        useAuthStore.getState().logout();
        if (!isPublicAuthPage()) {
          const from = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?from=${from}`;
        }
      }
    }
    return Promise.reject(err);
  }
);

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message;
  }
  if (err instanceof Error) return err.message;
  return 'Bir hata oluştu';
}

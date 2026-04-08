import axios, { AxiosError } from 'axios';

const isBrowser = typeof window !== 'undefined';

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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
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

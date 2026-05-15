import { redirect } from 'next/navigation';

/** Eski URL — tüm roller için ortak profil sayfasına yönlendir */
export default function CustomerProfileRedirect() {
  redirect('/dashboard/profile');
}

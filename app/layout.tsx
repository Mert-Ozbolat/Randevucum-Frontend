import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Randevucum | Randevu ve işletme yönetimi',
  description:
    'Kuaför, klinik, güzellik merkezi ve daha fazlası için online randevu alın; işletmeler müşterilerini tek panelden yönetir.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

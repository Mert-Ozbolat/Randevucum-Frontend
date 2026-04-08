import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Web Rezervasyon | Randevu Platformu',
  description: 'Kuaför, diş kliniği, güzellik merkezi ve restoranlar için randevu platformu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-900 dark:text-neutral-100 ${inter.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

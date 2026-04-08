import { Navbar } from '@/components/layout/Navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-neutral-50 dark:bg-neutral-900">{children}</main>
    </>
  );
}

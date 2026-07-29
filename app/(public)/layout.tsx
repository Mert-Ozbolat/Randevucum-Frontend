import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PresencePing } from "@/components/home/PresencePing";
import { CookieConsent } from "@/components/legal/CookieConsent";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PresencePing />
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] overflow-x-hidden bg-neutral-50 dark:bg-neutral-900">
        {children}
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}

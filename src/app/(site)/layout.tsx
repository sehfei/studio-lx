import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartProvider } from "@/components/cart/CartContext";
import { getAnnouncement } from "@/lib/announcement";
import { getIdentity } from "@/lib/identity";
import { getI18n } from "@/lib/i18n/dictionaries";
import { getCategories } from "@/lib/categories";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [announcement, identity, { locale, t }, categories] = await Promise.all([
    getAnnouncement(),
    getIdentity(),
    getI18n(),
    getCategories(),
  ]);

  return (
    <CartProvider>
      <AnnouncementBar announcement={announcement} closeLabel={t.nav.close} />
      <Navbar
        logoUrl={identity.logoUrl}
        locale={locale}
        t={t}
        categories={categories}
      />
      <main className="flex-1">{children}</main>
      <Footer identity={identity} t={t} />
      <WhatsAppButton whatsappNumber={identity.whatsappNumber} />
    </CartProvider>
  );
}

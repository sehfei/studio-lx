import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">{t.wishlist.title}</h1>
      <p className="text-sm text-foreground/50">{t.wishlist.empty}</p>
    </div>
  );
}

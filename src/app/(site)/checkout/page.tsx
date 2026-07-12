import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">{t.checkout.title}</h1>
      <p className="text-sm text-foreground/50">{t.checkout.comingSoon}</p>
    </div>
  );
}

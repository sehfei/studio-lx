import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8">
      <h1 className="section-title mb-8">{t.cart.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{t.cart.empty}</p>
      <Link href="/" className="btn-primary">
        {t.common.continueShopping}
      </Link>
    </div>
  );
}

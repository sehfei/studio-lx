import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/dictionaries";
import { CartClient } from "@/components/cart/CartClient";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const { t } = await getI18n();
  return <CartClient t={t} />;
}

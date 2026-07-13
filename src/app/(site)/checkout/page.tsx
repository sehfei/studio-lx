import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/dictionaries";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { requireCustomer } from "@/lib/customer-auth";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireCustomer("/checkout");
  const { t } = await getI18n();
  return <CheckoutClient t={t} customerEmail={user.email ?? ""} />;
}

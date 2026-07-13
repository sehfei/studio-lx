import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/dictionaries";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { requireCustomer } from "@/lib/customer-auth";
import { getShippingSettings } from "@/lib/shipping";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireCustomer("/checkout");
  const [{ t }, shippingSettings] = await Promise.all([
    getI18n(),
    getShippingSettings(),
  ]);
  return (
    <CheckoutClient
      t={t}
      customerEmail={user.email ?? ""}
      shippingSettings={shippingSettings}
    />
  );
}

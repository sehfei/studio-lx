import { requirePermission } from "@/lib/auth";
import { getPaymentSettings } from "@/lib/payment-settings";
import { PaymentSettingsForm } from "./PaymentSettingsForm";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminPaymentSettingsPage() {
  await requirePermission("paymentSettings");
  const { t } = await getAdminI18n();
  const dict = t.pages.paymentSettings;
  const settings = await getPaymentSettings();

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">{dict.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{dict.desc}</p>
      <PaymentSettingsForm initial={settings} dict={dict} common={t.common} />
    </div>
  );
}

import { requirePermission } from "@/lib/auth";
import { getShippingSettings } from "@/lib/shipping";
import { ShippingForm } from "./ShippingForm";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  await requirePermission("shipping");
  const { t } = await getAdminI18n();
  const dict = t.pages.shipping;
  const settings = await getShippingSettings();

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">{dict.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{dict.desc}</p>
      <ShippingForm initial={settings} dict={dict} common={t.common} />
    </div>
  );
}

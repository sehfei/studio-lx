import { requirePermission } from "@/lib/auth";
import { getShippingSettings } from "@/lib/shipping";
import { ShippingForm } from "./ShippingForm";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  await requirePermission("shipping");
  const settings = await getShippingSettings();

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">Shipping</h1>
      <p className="mb-8 text-sm text-foreground/50">
        西马/东马分开计费，结账时按顾客选的州属自动计算。
      </p>
      <ShippingForm initial={settings} />
    </div>
  );
}

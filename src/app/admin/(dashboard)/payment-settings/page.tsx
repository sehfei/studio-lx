import { getPaymentSettings } from "@/lib/payment-settings";
import { PaymentSettingsForm } from "./PaymentSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminPaymentSettingsPage() {
  const settings = await getPaymentSettings();

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">Payment Settings</h1>
      <p className="mb-8 text-sm text-foreground/50">
        手动收款模式：这里的银行信息会显示在订单确认页给顾客看，顾客转账后店主在订单页手动标记「已付款」。
      </p>
      <PaymentSettingsForm initial={settings} />
    </div>
  );
}

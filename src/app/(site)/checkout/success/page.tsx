import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getI18n } from "@/lib/i18n/dictionaries";
import { getPaymentSettings } from "@/lib/payment-settings";
import { requireCustomer } from "@/lib/customer-auth";

export const metadata: Metadata = { title: "Order Confirmed" };

// 结账现在要求先登录，这里用 service_role 按订单 id 查（不走 RLS 公开策略），
// 查到后还要核对 customer_id 是不是当前登录人，防止拿别人的订单链接也能看。
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  const user = await requireCustomer(`/checkout/success?order=${orderId}`);
  const [{ t }, payment] = await Promise.all([
    getI18n(),
    getPaymentSettings(),
  ]);

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, total, customer_name, customer_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.customer_id !== user.id) notFound();

  const hasBankInfo = Boolean(payment.bankName && payment.accountNumber);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-8">
      <h1 className="section-title mb-4">{t.orderConfirm.title}</h1>
      <p className="mb-8 text-sm text-foreground/60">{t.orderConfirm.thankYou}</p>
      <div className="mb-8 border border-border-subtle p-6">
        <p className="eyebrow mb-2">{t.orderConfirm.orderNumber}</p>
        <p className="text-lg font-medium">{order.order_number}</p>
        <p className="mt-4 text-sm text-foreground/60">
          RM {Number(order.total).toFixed(2)}
        </p>
      </div>

      {hasBankInfo && (
        <div className="mb-8 border border-gold/40 bg-gold/5 p-6 text-left">
          <p className="eyebrow mb-3">{t.orderConfirm.paymentInfo}</p>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/50">{t.orderConfirm.bankName}</dt>
              <dd>{payment.bankName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">{t.orderConfirm.accountName}</dt>
              <dd>{payment.accountName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">{t.orderConfirm.accountNumber}</dt>
              <dd>{payment.accountNumber}</dd>
            </div>
          </dl>
          {payment.instructions && (
            <p className="mt-3 text-xs text-foreground/60">
              {payment.instructions}
            </p>
          )}
        </div>
      )}

      <p className="mb-10 text-sm text-foreground/60">
        {t.orderConfirm.manualPayment}
      </p>
      <Link href="/" className="btn-primary">
        {t.orderConfirm.backToShop}
      </Link>
    </div>
  );
}

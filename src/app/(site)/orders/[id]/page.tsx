import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getI18n } from "@/lib/i18n/dictionaries";
import { requireCustomer } from "@/lib/customer-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCustomer(`/orders/${id}`);
  const { t } = await getI18n();

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // 归属校验：这张订单不是当前登录顾客的，一律当作不存在，
  // 不能让顾客改 URL 看到别人的收货信息和订单内容。
  if (!order || order.customer_id !== user.id) notFound();

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <Link
        href="/orders"
        className="mb-6 inline-block text-xs text-foreground/50 hover:text-gold"
      >
        ← {t.orders.backToOrders}
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="section-title">{order.order_number}</h1>
        <span className="text-sm text-foreground/60">
          {t.orders.statusLabels[order.status] ?? order.status}
        </span>
      </div>

      <div className="mb-8">
        <h2 className="eyebrow mb-3">{t.orders.shippingAddress}</h2>
        <p className="text-sm text-foreground/70">
          {order.customer_name} · {order.customer_phone}
          <br />
          {order.shipping_address}, {order.shipping_city},{" "}
          {order.shipping_state} {order.shipping_postcode}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="eyebrow mb-3">{t.orders.items}</h2>
        <ul
          className="divide-y divide-border-subtle border border-border-subtle"
          style={{ borderRadius: "var(--radius)" }}
        >
          {(items ?? []).map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between p-4 text-sm"
            >
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-xs text-foreground/50">
                  {(item.color || item.size) &&
                    [item.color, item.size].filter(Boolean).join(" / ")}
                  {" · "}
                  RM {Number(item.unit_price).toFixed(2)} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                RM {Number(item.line_total).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-1 border-t border-border-subtle pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-foreground/50">{t.cart.subtotal}</span>
          <span>RM {Number(order.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/50">{t.checkout.shippingFee}</span>
          <span>RM {Number(order.shipping_fee).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-medium">
          <span>{t.checkout.total}</span>
          <span>RM {Number(order.total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-2">
          <span className="text-foreground/50">
            {order.payment_status === "paid" ? t.orders.paid : t.orders.unpaid}
          </span>
        </div>
      </div>
    </div>
  );
}

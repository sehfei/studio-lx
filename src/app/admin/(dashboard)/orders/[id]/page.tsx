import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { OrderStatusControls } from "../OrderStatusControls";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("orders");
  const { id } = await params;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 inline-block text-xs text-foreground/50 hover:text-gold"
      >
        ← Back to Orders
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-medium">{order.order_number}</h1>
        <OrderStatusControls
          id={order.id}
          status={order.status}
          paymentStatus={order.payment_status}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="eyebrow mb-3">收货信息</h2>
          <dl className="space-y-2 border border-border-subtle p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/50">Name</dt>
              <dd>{order.customer_name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/50">Phone</dt>
              <dd>{order.customer_phone}</dd>
            </div>
            {order.customer_email && (
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/50">Email</dt>
                <dd>{order.customer_email}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/50">Address</dt>
              <dd className="text-right">
                {order.shipping_address}, {order.shipping_city},{" "}
                {order.shipping_state} {order.shipping_postcode}
              </dd>
            </div>
            {order.notes && (
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/50">Notes</dt>
                <dd className="text-right">{order.notes}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/50">Placed At</dt>
              <dd>{new Date(order.created_at).toLocaleString("en-MY")}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="eyebrow mb-3">商品明细</h2>
          <ul className="divide-y divide-border-subtle border border-border-subtle">
            {(items ?? []).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-4 text-sm"
              >
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-xs text-foreground/50">
                    {item.product_sku}
                    {(item.color || item.size) &&
                      ` · ${[item.color, item.size].filter(Boolean).join(" / ")}`}
                  </p>
                  <p className="text-xs text-foreground/50">
                    RM {Number(item.unit_price).toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  RM {Number(item.line_total).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border-subtle pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/50">Subtotal</span>
              <span>RM {Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Shipping Fee</span>
              <span>RM {Number(order.shipping_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span>RM {Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

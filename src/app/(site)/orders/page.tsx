import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/dictionaries";
import { requireCustomer } from "@/lib/customer-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Order History" };

export default async function OrdersPage() {
  const user = await requireCustomer("/orders");
  const { t } = await getI18n();

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, total, status, payment_status, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">{t.orders.title}</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-foreground/50">{t.orders.empty}</p>
      ) : (
        <ul className="divide-y divide-border-subtle border-t border-b border-border-subtle">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex items-center justify-between py-4 text-sm hover:text-gold"
              >
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="mt-1 text-xs text-foreground/50">
                    {new Date(order.created_at).toLocaleDateString("en-MY", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    ·{" "}
                    {t.orders.statusLabels[order.status] ?? order.status}
                    {" · "}
                    {order.payment_status === "paid"
                      ? t.orders.paid
                      : t.orders.unpaid}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span>RM {Number(order.total).toFixed(2)}</span>
                  <span>›</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

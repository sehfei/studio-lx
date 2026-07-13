import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { OrderStatusControls } from "./OrderStatusControls";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, total, status, payment_status, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">Orders</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-foreground/50">还没有任何订单。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
                <th className="py-3">Order #</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Total</th>
                <th className="py-3">Status / Payment</th>
                <th className="py-3">Date</th>
                <th className="py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border-subtle">
                  <td className="py-3 font-medium">{o.order_number}</td>
                  <td className="py-3">{o.customer_name}</td>
                  <td className="py-3 text-foreground/60">
                    {o.customer_phone}
                  </td>
                  <td className="py-3">RM {Number(o.total).toFixed(2)}</td>
                  <td className="py-3">
                    <OrderStatusControls
                      id={o.id}
                      status={o.status}
                      paymentStatus={o.payment_status}
                    />
                  </td>
                  <td className="py-3 text-foreground/60">
                    {new Date(o.created_at).toLocaleDateString("en-MY", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-xs text-foreground/60 hover:text-gold hover:underline"
                    >
                      查看
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-6 text-xs text-foreground/40">订单数据来自 Supabase。</p>
    </div>
  );
}

import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { OrderStatusControls } from "./OrderStatusControls";
import { AdminTable } from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requirePermission("orders");
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, total, status, payment_status, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">Orders</h1>

      <AdminTable
        emptyText="还没有任何订单。"
        columns={[
          { key: "orderNumber", label: "Order #", cellClassName: "font-medium" },
          { key: "customer", label: "Customer" },
          { key: "phone", label: "Phone", cellClassName: "text-foreground/60" },
          { key: "total", label: "Total" },
          { key: "status", label: "Status / Payment" },
          { key: "date", label: "Date", cellClassName: "text-foreground/60" },
          { key: "actions", label: "操作" },
        ]}
        rows={(orders ?? []).map((o) => ({
          key: o.id,
          cells: {
            orderNumber: o.order_number,
            customer: o.customer_name,
            phone: o.customer_phone,
            total: `RM ${Number(o.total).toFixed(2)}`,
            status: (
              <OrderStatusControls
                id={o.id}
                status={o.status}
                paymentStatus={o.payment_status}
              />
            ),
            date: new Date(o.created_at).toLocaleDateString("en-MY", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            actions: (
              <Link
                href={`/admin/orders/${o.id}`}
                className="text-xs text-foreground/60 hover:text-gold hover:underline"
              >
                查看
              </Link>
            ),
          },
        }))}
      />
      <p className="mt-6 text-xs text-foreground/40">订单数据来自 Supabase。</p>
    </div>
  );
}

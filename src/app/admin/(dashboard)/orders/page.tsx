import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { OrderStatusControls } from "./OrderStatusControls";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requirePermission("orders");
  const { t } = await getAdminI18n();
  const dict = t.pages.orders;
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, total, status, payment_status, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">{dict.title}</h1>

      <AdminTable
        emptyText={dict.empty}
        columns={[
          { key: "orderNumber", label: dict.columns.orderNumber, cellClassName: "font-medium" },
          { key: "customer", label: dict.columns.customer },
          { key: "phone", label: dict.columns.phone, cellClassName: "text-foreground/60" },
          { key: "total", label: dict.columns.total },
          { key: "status", label: dict.columns.status },
          { key: "date", label: dict.columns.date, cellClassName: "text-foreground/60" },
          { key: "actions", label: dict.columns.actions },
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
                {dict.view}
              </Link>
            ),
          },
        }))}
      />
      <p className="mt-6 text-xs text-foreground/40">{dict.footer}</p>
    </div>
  );
}

import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminSalesReportPage() {
  await requirePermission("salesReport");
  const { t } = await getAdminI18n();
  const dict = t.pages.salesReport;
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("total, status, payment_status, created_at");

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_name, quantity, line_total");

  const allOrders = orders ?? [];
  const paidOrders = allOrders.filter((o) => o.payment_status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const cancelledCount = allOrders.filter(
    (o) => o.status === "cancelled",
  ).length;

  // 按商品名聚合销量和销售额，找出卖得最好的几个
  const byProduct = new Map<string, { quantity: number; revenue: number }>();
  for (const item of items ?? []) {
    const prev = byProduct.get(item.product_name) ?? {
      quantity: 0,
      revenue: 0,
    };
    byProduct.set(item.product_name, {
      quantity: prev.quantity + item.quantity,
      revenue: prev.revenue + Number(item.line_total),
    });
  }
  const topProducts = [...byProduct.entries()]
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 10);

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">{dict.title}</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border border-border-subtle p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            {dict.totalOrders}
          </p>
          <p className="mt-2 text-2xl font-display">{allOrders.length}</p>
        </div>
        <div className="border border-gold/30 p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            {dict.revenuePaid}
          </p>
          <p className="mt-2 text-2xl font-display text-gold">
            RM {revenue.toFixed(2)}
          </p>
        </div>
        <div className="border border-border-subtle p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            {dict.paidOrders}
          </p>
          <p className="mt-2 text-2xl font-display">{paidOrders.length}</p>
        </div>
        <div className="border border-destructive/30 p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            {dict.cancelled}
          </p>
          <p className="mt-2 text-2xl font-display text-destructive">
            {cancelledCount}
          </p>
        </div>
      </div>

      <h2 className="eyebrow mb-4">{dict.topProducts}</h2>
      <AdminTable
        emptyText={dict.empty}
        columns={[
          { key: "product", label: dict.columns.product },
          { key: "quantity", label: dict.columns.quantitySold },
          { key: "revenue", label: dict.columns.revenue },
        ]}
        rows={topProducts.map(([name, stat]) => ({
          key: name,
          cells: {
            product: name,
            quantity: stat.quantity,
            revenue: `RM ${stat.revenue.toFixed(2)}`,
          },
        }))}
      />
      <p className="mt-6 text-xs text-foreground/40">{dict.footer}</p>
    </div>
  );
}

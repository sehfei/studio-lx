import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminSalesReportPage() {
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
      <h1 className="mb-8 text-lg font-medium">Sales Report</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border border-border-subtle p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            Total Orders
          </p>
          <p className="mt-2 text-2xl font-display">{allOrders.length}</p>
        </div>
        <div className="border border-gold/30 p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            Revenue (Paid)
          </p>
          <p className="mt-2 text-2xl font-display text-gold">
            RM {revenue.toFixed(2)}
          </p>
        </div>
        <div className="border border-border-subtle p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            Paid Orders
          </p>
          <p className="mt-2 text-2xl font-display">{paidOrders.length}</p>
        </div>
        <div className="border border-destructive/30 p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            Cancelled
          </p>
          <p className="mt-2 text-2xl font-display text-destructive">
            {cancelledCount}
          </p>
        </div>
      </div>

      <h2 className="eyebrow mb-4">畅销商品（按销量）</h2>
      {topProducts.length === 0 ? (
        <p className="text-sm text-foreground/50">还没有销售数据。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
                <th className="py-3">Product</th>
                <th className="py-3">Quantity Sold</th>
                <th className="py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(([name, stat]) => (
                <tr key={name} className="border-b border-border-subtle">
                  <td className="py-3">{name}</td>
                  <td className="py-3">{stat.quantity}</td>
                  <td className="py-3">RM {stat.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-6 text-xs text-foreground/40">
        统计数据来自 Supabase 订单表，实时计算。
      </p>
    </div>
  );
}

import { requirePermission } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminTable } from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requirePermission("customers");
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
  const customers = (userList?.users ?? []).filter(
    (u) => u.app_metadata?.role !== "admin",
  );

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("customer_id, total");

  // 按顾客聚合订单数和消费总额，客户列表本身来自 Supabase Auth，
  // 消费统计来自 orders 表，两边按 customer_id 拼在一起
  const statsByCustomer = new Map<string, { count: number; total: number }>();
  for (const order of orders ?? []) {
    if (!order.customer_id) continue;
    const prev = statsByCustomer.get(order.customer_id) ?? {
      count: 0,
      total: 0,
    };
    statsByCustomer.set(order.customer_id, {
      count: prev.count + 1,
      total: prev.total + Number(order.total),
    });
  }

  const rows = customers
    .map((c) => ({
      id: c.id,
      email: c.email ?? "",
      name: (c.user_metadata?.name as string | undefined) ?? "—",
      createdAt: c.created_at,
      orderCount: statsByCustomer.get(c.id)?.count ?? 0,
      totalSpend: statsByCustomer.get(c.id)?.total ?? 0,
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">Customers</h1>

      <AdminTable
        emptyText="还没有顾客注册。"
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email", cellClassName: "text-foreground/60" },
          { key: "joined", label: "Joined", cellClassName: "text-foreground/60" },
          { key: "orders", label: "Orders" },
          { key: "totalSpend", label: "Total Spend" },
        ]}
        rows={rows.map((r) => ({
          key: r.id,
          cells: {
            name: r.name,
            email: r.email,
            joined: new Date(r.createdAt).toLocaleDateString("en-MY"),
            orders: r.orderCount,
            totalSpend: `RM ${r.totalSpend.toFixed(2)}`,
          },
        }))}
      />
      <p className="mt-6 text-xs text-foreground/40">
        客户数据来自 Supabase Auth，消费统计来自订单数据。
      </p>
    </div>
  );
}

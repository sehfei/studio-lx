import { getAllProducts } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, { data: orders }, { data: userList }] = await Promise.all([
    getAllProducts(),
    supabaseAdmin.from("orders").select("total, payment_status"),
    supabaseAdmin.auth.admin.listUsers(),
  ]);

  const customerCount = (userList?.users ?? []).filter(
    (u) => u.app_metadata?.role !== "admin",
  ).length;
  const revenue = (orders ?? [])
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { label: "Total Products", value: products.length },
    { label: "Orders", value: (orders ?? []).length },
    { label: "Customers", value: customerCount },
    { label: "Revenue (RM)", value: revenue.toFixed(2) },
  ];

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-border-subtle p-6"
          >
            <p className="text-xs tracking-widest text-foreground/50 uppercase">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-display">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

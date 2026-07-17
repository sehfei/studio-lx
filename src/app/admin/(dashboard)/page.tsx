import { getAllProducts } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { listAllUsers } from "@/lib/supabase/list-all-users";
import { getAdminI18n } from "@/lib/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { t } = await getAdminI18n();
  const dict = t.pages.dashboard;
  const [products, { data: orders }, users] = await Promise.all([
    getAllProducts(),
    supabaseAdmin.from("orders").select("total, payment_status"),
    listAllUsers(),
  ]);

  const customerCount = users.filter(
    (u) => u.app_metadata?.role !== "admin",
  ).length;
  const revenue = (orders ?? [])
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { label: dict.totalProducts, value: products.length },
    { label: dict.orders, value: (orders ?? []).length },
    { label: dict.customers, value: customerCount },
    { label: dict.revenue, value: revenue.toFixed(2) },
  ];

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">{dict.title}</h1>
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

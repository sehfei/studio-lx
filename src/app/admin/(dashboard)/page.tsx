import { getAllProducts } from "@/lib/products";

export default async function AdminDashboardPage() {
  const products = await getAllProducts();

  const stats = [
    { label: "Total Products", value: products.length },
    { label: "Orders", value: 0 },
    { label: "Customers", value: 0 },
    { label: "Revenue (RM)", value: "0.00" },
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
      <p className="mt-8 text-sm text-foreground/40">
        商品数据已经接入 Supabase，订单/客户/营收还是占位，等对应功能做完会显示真实数据。
      </p>
    </div>
  );
}

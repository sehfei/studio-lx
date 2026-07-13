import Link from "next/link";
import { getAllProducts } from "@/lib/products";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminInventoryPage() {
  const products = await getAllProducts();
  const sorted = [...products].sort((a, b) => a.stock - b.stock);

  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD,
  ).length;

  return (
    <div>
      <h1 className="mb-8 text-lg font-medium">Inventory</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="border border-border-subtle p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            Total Products
          </p>
          <p className="mt-2 text-2xl font-display">{products.length}</p>
        </div>
        <div className="border border-destructive/30 p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            Out of Stock
          </p>
          <p className="mt-2 text-2xl font-display text-destructive">
            {outOfStockCount}
          </p>
        </div>
        <div className="border border-gold/30 p-4">
          <p className="text-xs tracking-widest text-foreground/50 uppercase">
            Low Stock (≤{LOW_STOCK_THRESHOLD})
          </p>
          <p className="mt-2 text-2xl font-display text-gold">
            {lowStockCount}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
              <th className="py-3">Name</th>
              <th className="py-3">SKU</th>
              <th className="py-3">Stock</th>
              <th className="py-3">Status</th>
              <th className="py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id} className="border-b border-border-subtle">
                <td className="py-3">{p.name}</td>
                <td className="py-3 text-foreground/60">{p.sku}</td>
                <td className="py-3">{p.stock}</td>
                <td className="py-3">
                  {p.stock <= 0 ? (
                    <span className="text-destructive">缺货</span>
                  ) : p.stock <= LOW_STOCK_THRESHOLD ? (
                    <span className="text-gold">库存偏低</span>
                  ) : (
                    <span className="text-foreground/50">正常</span>
                  )}
                </td>
                <td className="py-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-xs text-foreground/60 hover:text-gold hover:underline"
                  >
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

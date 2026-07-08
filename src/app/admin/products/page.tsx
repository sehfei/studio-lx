import Link from "next/link";
import { getAllProducts } from "@/lib/products";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-lg font-medium">Products</h1>
        <Link href="/admin/products/upload" className="btn-primary">
          + Upload Product Image
        </Link>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
            <th className="py-3">Name</th>
            <th className="py-3">SKU</th>
            <th className="py-3">Brand</th>
            <th className="py-3">Price</th>
            <th className="py-3">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-border-subtle">
              <td className="py-3">{p.name}</td>
              <td className="py-3 text-foreground/60">{p.sku}</td>
              <td className="py-3 text-foreground/60">{p.brand}</td>
              <td className="py-3">RM {p.price.toFixed(2)}</td>
              <td className="py-3">{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-6 text-xs text-foreground/40">
        商品数据来自 Supabase。新增/编辑商品的表单还在开发中，现在只能在
        Supabase 后台直接改数据。
      </p>
    </div>
  );
}

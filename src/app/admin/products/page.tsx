import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-lg font-medium">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + Add Product
        </Link>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
            <th className="py-3">Image</th>
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
              <td className="py-3">
                {p.images[0] ? (
                  <div className="relative h-12 w-12 overflow-hidden border border-border-subtle">
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 border border-dashed border-border-subtle" />
                )}
              </td>
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
        商品数据来自 Supabase。编辑/删除商品的表单还在开发中，暂时需要在
        Supabase 后台改。
      </p>
    </div>
  );
}

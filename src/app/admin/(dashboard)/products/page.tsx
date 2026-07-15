import Image from "next/image";
import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { getAllProducts } from "@/lib/products";
import { DeleteProductButton } from "./DeleteProductButton";
import { AdminTable } from "@/components/admin/AdminTable";

export default async function AdminProductsPage() {
  await requirePermission("products");
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-lg font-medium">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + Add Product
        </Link>
      </div>

      <AdminTable
        emptyText="还没有商品。"
        columns={[
          { key: "image", label: "Image" },
          { key: "name", label: "Name" },
          { key: "sku", label: "SKU", cellClassName: "text-foreground/60" },
          { key: "brand", label: "Brand", cellClassName: "text-foreground/60" },
          { key: "price", label: "Price" },
          { key: "stock", label: "Stock" },
          { key: "actions", label: "操作" },
        ]}
        rows={products.map((p) => ({
          key: p.id,
          cells: {
            image: p.images[0] ? (
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
            ),
            name: p.name,
            sku: p.sku,
            brand: p.brand,
            price: `RM ${p.price.toFixed(2)}`,
            stock: p.stock,
            actions: (
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="text-xs text-foreground/60 hover:text-gold hover:underline"
                >
                  编辑
                </Link>
                <DeleteProductButton id={p.id} name={p.name} />
              </div>
            ),
          },
        }))}
      />
      <p className="mt-6 text-xs text-foreground/40">商品数据来自 Supabase。</p>
    </div>
  );
}

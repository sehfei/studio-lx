import Image from "next/image";
import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { getAllProducts } from "@/lib/products";
import { DeleteProductButton } from "./DeleteProductButton";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminI18n } from "@/lib/i18n/admin";

export default async function AdminProductsPage() {
  await requirePermission("products");
  const { t } = await getAdminI18n();
  const dict = t.pages.products;
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-lg font-medium">{dict.title}</h1>
        <Link href="/admin/products/new" className="btn-primary">
          {dict.addButton}
        </Link>
      </div>

      <AdminTable
        emptyText={dict.empty}
        columns={[
          { key: "image", label: dict.columns.image },
          { key: "name", label: dict.columns.name },
          { key: "sku", label: dict.columns.sku, cellClassName: "text-foreground/60" },
          { key: "brand", label: dict.columns.brand, cellClassName: "text-foreground/60" },
          { key: "price", label: dict.columns.price },
          { key: "stock", label: dict.columns.stock },
          { key: "actions", label: dict.columns.actions },
        ]}
        rows={products.map((p) => ({
          key: p.id,
          cells: {
            image: p.images[0] ? (
              <div className="relative h-12 w-12 overflow-hidden border border-border-subtle">
                <Image
                  src={p.images[0].url}
                  alt={p.images[0].alt}
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
                  {dict.edit}
                </Link>
                <DeleteProductButton id={p.id} name={p.name} />
              </div>
            ),
          },
        }))}
      />
      <p className="mt-6 text-xs text-foreground/40">{dict.footer}</p>
    </div>
  );
}

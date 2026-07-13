import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/dictionaries";
import { requireCustomer } from "@/lib/customer-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { mapRow, type ProductRow } from "@/lib/products";
import { ProductGrid } from "@/components/ui/ProductGrid";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireCustomer("/wishlist");
  const { t } = await getI18n();

  const { data: rows } = await supabaseAdmin
    .from("wishlist_items")
    .select("product_id, created_at, products(*)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const products = (rows ?? [])
    .map((r) => r.products as unknown as ProductRow | null)
    .filter((p): p is ProductRow => p !== null)
    .map(mapRow);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">{t.wishlist.title}</h1>
      <ProductGrid
        products={products}
        emptyText={t.wishlist.empty}
        outOfStockText={t.product.outOfStock}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByTag } from "@/lib/products";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = { title: "Promotion" };

export default async function PromotionPage() {
  const [products, { t }] = await Promise.all([
    getProductsByTag("promotion"),
    getI18n(),
  ]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-10">{t.categories.promotion}</h1>
      <ProductGrid
        products={products}
        emptyText={t.home.emptyProducts}
        outOfStockText={t.product.outOfStock}
      />
    </div>
  );
}

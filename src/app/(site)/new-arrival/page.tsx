import type { Metadata } from "next";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByTag } from "@/lib/products";
import { getI18n } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "New Arrival",
  alternates: { canonical: "/new-arrival" },
};

export default async function NewArrivalPage() {
  const [products, { t }] = await Promise.all([
    getProductsByTag("new-arrival"),
    getI18n(),
  ]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-10">{t.categories.newArrival}</h1>
      <ProductGrid
        products={products}
        emptyText={t.home.emptyProducts}
        outOfStockText={t.product.outOfStock}
      />
    </div>
  );
}

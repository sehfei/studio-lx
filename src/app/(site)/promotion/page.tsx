import type { Metadata } from "next";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByTag } from "@/lib/products";

export const metadata: Metadata = { title: "Promotion" };

export default function PromotionPage() {
  const products = getProductsByTag("promotion");
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-10">Promotion</h1>
      <ProductGrid products={products} />
    </div>
  );
}

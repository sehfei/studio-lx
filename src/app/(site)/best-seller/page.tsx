import type { Metadata } from "next";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByTag } from "@/lib/products";

export const metadata: Metadata = { title: "Best Seller" };

export default async function BestSellerPage() {
  const products = await getProductsByTag("best-seller");
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-10">Best Seller</h1>
      <ProductGrid products={products} />
    </div>
  );
}

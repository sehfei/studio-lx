import type { Metadata } from "next";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { getProductsByTag } from "@/lib/products";

export const metadata: Metadata = { title: "New Arrival" };

export default async function NewArrivalPage() {
  const products = await getProductsByTag("new-arrival");
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="section-title mb-10">New Arrival</h1>
      <ProductGrid products={products} />
    </div>
  );
}

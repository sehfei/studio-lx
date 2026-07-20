import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  emptyText = "No products yet.",
  outOfStockText,
}: {
  products: Product[];
  emptyText?: string;
  outOfStockText?: string;
}) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-foreground/50">{emptyText}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          outOfStockText={outOfStockText}
        />
      ))}
    </div>
  );
}

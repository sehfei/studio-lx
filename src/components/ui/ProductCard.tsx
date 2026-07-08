import Link from "next/link";
import { PlaceholderImage } from "./PlaceholderImage";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount =
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <PlaceholderImage label={product.name} />
      <div className="mt-3 space-y-1">
        <p className="eyebrow">{product.brand}</p>
        <h3 className="text-sm text-foreground group-hover:text-gold">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          {hasDiscount ? (
            <>
              <span className="text-gold">
                RM {product.discountPrice!.toFixed(2)}
              </span>
              <span className="text-foreground/40 line-through">
                RM {product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span>RM {product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { ProductImage } from "./ProductImage";
import { ProductBadge } from "./ProductBadge";
import { discountPercent, displayBadge, type Product } from "@/lib/products";

export function ProductCard({
  product,
  outOfStockText = "Out of Stock",
}: {
  product: Product;
  outOfStockText?: string;
}) {
  const hasDiscount =
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price;
  const badge = displayBadge(product, outOfStockText);
  const outOfStock = product.stock <= 0;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative">
        {badge && <ProductBadge text={badge.text} variant={badge.variant} />}
        <div className={outOfStock ? "opacity-60 grayscale" : ""}>
          <ProductImage src={product.images[0]} label={product.name} />
        </div>
      </div>
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
              {discountPercent(product.price, product.discountPrice!) > 0 && (
                <span
                  className="bg-gold px-1.5 py-0.5 text-xs font-medium text-background"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  -{discountPercent(product.price, product.discountPrice!)}%
                </span>
              )}
            </>
          ) : (
            <span>RM {product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

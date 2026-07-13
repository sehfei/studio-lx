"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import type { Product } from "@/lib/products";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AddToCartForm({
  product,
  t,
}: {
  product: Product;
  t: Dictionary;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  const unitPrice =
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

  const buildItem = () => ({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0],
    price: unitPrice,
    color,
    size,
    quantity: 1,
  });

  const handleAddToCart = () => {
    addItem(buildItem());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(buildItem());
    router.push("/checkout");
  };

  return (
    <>
      {product.colors.length > 0 && (
        <div className="mb-6">
          <p className="eyebrow mb-2">{t.product.color}</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`border px-4 py-2 text-sm ${
                  c === color
                    ? "border-gold text-gold"
                    : "border-border-subtle hover:border-gold hover:text-gold"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="mb-8">
          <p className="eyebrow mb-2">{t.product.size}</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`border px-4 py-2 text-sm ${
                  s === size
                    ? "border-gold text-gold"
                    : "border-border-subtle hover:border-gold hover:text-gold"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="btn-primary flex-1"
        >
          {outOfStock ? t.product.outOfStock : added ? t.product.added : t.product.addToCart}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="btn-outline flex-1"
        >
          {t.product.buyNow}
        </button>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { cartItemKey } from "@/lib/cart";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CartClient({ t }: { t: Dictionary }) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8">
        <h1 className="section-title mb-8">{t.cart.title}</h1>
        <p className="mb-8 text-sm text-foreground/50">{t.cart.empty}</p>
        <Link href="/" className="btn-primary">
          {t.common.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">{t.cart.title}</h1>

      <ul className="divide-y divide-border-subtle border-t border-b border-border-subtle">
        {items.map((item) => {
          const key = cartItemKey(item);
          return (
            <li key={key} className="flex items-center gap-4 py-4">
              <div className="w-20 shrink-0">
                <ProductImage src={item.image} label={item.name} />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm font-medium hover:text-gold"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-foreground/50">
                  {[item.color, item.size].filter(Boolean).join(" / ")}
                </p>
                <p className="mt-1 text-sm text-gold">
                  RM {item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-foreground/50" htmlFor={`qty-${key}`}>
                  {t.cart.quantity}
                </label>
                <input
                  id={`qty-${key}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(key, Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-16 border border-border-subtle px-2 py-1 text-sm outline-none focus:border-gold"
                />
              </div>
              <p className="w-24 shrink-0 text-right text-sm">
                RM {(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                type="button"
                onClick={() => removeItem(key)}
                className="shrink-0 text-xs text-foreground/40 hover:text-destructive"
              >
                {t.cart.remove}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex items-center gap-4 text-lg">
          <span className="text-foreground/60">{t.cart.subtotal}</span>
          <span className="font-medium">RM {subtotal.toFixed(2)}</span>
        </div>
        <Link href="/checkout" className="btn-primary">
          {t.cart.proceedToCheckout}
        </Link>
      </div>
    </div>
  );
}

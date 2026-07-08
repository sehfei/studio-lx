import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-8">
      <h1 className="section-title mb-8">Cart</h1>
      <p className="mb-8 text-sm text-foreground/50">
        购物车是空的。购物车功能开发中。
      </p>
      <Link href="/" className="btn-primary">
        Continue Shopping
      </Link>
    </div>
  );
}

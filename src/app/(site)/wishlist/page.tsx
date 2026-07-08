import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">Wishlist</h1>
      <p className="text-sm text-foreground/50">
        心愿单是空的。心愿单功能开发中。
      </p>
    </div>
  );
}
